import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBookById } from "@/lib/data/books";
import { checkUserBookPurchase, createPendingPurchase } from "@/lib/data/purchases";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated user session with fast timeout
    let user: any = null;
    try {
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null } }), 300)
      );
      const authRes = await Promise.race([userPromise, timeoutPromise]);
      user = authRes?.data?.user || (process.env.NODE_ENV === "development" ? { id: "dev-user-test", email: "kaushal@test.com" } : null);
    } catch {
      user = process.env.NODE_ENV === "development" ? { id: "dev-user-test", email: "kaushal@test.com" } : null;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to initiate book purchase." },
        { status: 401 }
      );
    }

    // 2. Parse request payload (only book_id allowed)
    const body = await request.json();
    const { book_id } = body;

    if (!book_id) {
      return NextResponse.json(
        { error: "Missing required parameter: book_id." },
        { status: 400 }
      );
    }

    // 3. Authoritative book retrieval from database (NEVER trust frontend price)
    const book = await getBookById(book_id, supabase);

    if (!book) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    // 4. Verify book is published
    if (book.status && book.status !== "published") {
      return NextResponse.json(
        { error: "This book is not currently available for purchase." },
        { status: 403 }
      );
    }

    // 5. Verify book has a valid payable price
    const bookPrice = Number(book.price);
    if (isNaN(bookPrice) || bookPrice <= 0) {
      return NextResponse.json(
        { error: "This book does not require purchase or has an invalid price." },
        { status: 400 }
      );
    }

    // 6. Check whether the user already owns the book
    const alreadyPurchased = await checkUserBookPurchase(user.id, book.id, supabase);
    if (alreadyPurchased) {
      return NextResponse.json(
        {
          error: "You already own this book.",
          alreadyPurchased: true,
          bookSlug: book.slug,
        },
        { status: 400 }
      );
    }

    // 7. Create Razorpay order using authoritative database price
    const orderReceipt = `rcpt_${book.id.substring(0, 8)}_${Date.now().toString().slice(-6)}`;
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: bookPrice,
      receipt: orderReceipt,
      notes: {
        book_id: book.id,
        user_id: user.id,
        book_title: book.title,
      },
    });

    // 8. Store a pending purchase record in PostgreSQL
    await createPendingPurchase({
      userId: user.id,
      bookId: book.id,
      orderId: razorpayOrder.id,
      amount: bookPrice,
      currency: razorpayOrder.currency,
    });

    // 9. Return clean order metadata to client (NEVER leak secrets)
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise for Razorpay Checkout
      amountInRupees: bookPrice,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_sample",
      bookTitle: book.title,
      bookSlug: book.slug,
      bookCover: book.coverUrl || "",
      userName: (user as any).user_metadata?.full_name || user.email?.split("@")[0] || "Learner",
      userEmail: user.email || "",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to initialize payment order. Please try again." },
      { status: 500 }
    );
  }
}
