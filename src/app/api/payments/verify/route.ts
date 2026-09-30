import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBookById } from "@/lib/data/books";
import {
  checkUserBookPurchase,
  markPurchasePaid,
} from "@/lib/data/purchases";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated user session
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const user = authUser || (process.env.NODE_ENV === "development" ? { id: "dev-user-test", email: "kaushal@test.com" } : null);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    // 2. Parse request payload
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      book_id,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !book_id) {
      return NextResponse.json(
        { error: "Incomplete payment verification payload." },
        { status: 400 }
      );
    }

    // 3. Authoritative book retrieval
    const book = await getBookById(book_id, supabase);
    if (!book) {
      return NextResponse.json(
        { error: "Associated book does not exist." },
        { status: 404 }
      );
    }

    // 4. Idempotency check: Has this user already unlocked this book?
    const alreadyPurchased = await checkUserBookPurchase(user.id, book.id, supabase);
    if (alreadyPurchased) {
      return NextResponse.json({
        success: true,
        message: "Book is already purchased and unlocked.",
        bookSlug: book.slug,
        alreadyPurchased: true,
      });
    }

    // 5. Cryptographic signature verification using server-only secret
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    // 6. Update database record to 'paid' with verified timestamp
    const purchase = await markPurchasePaid(
      {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        userId: user.id,
        bookId: book.id,
      },
      supabase
    );

    if (!purchase) {
      return NextResponse.json(
        { error: "Failed to record verified purchase in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and book unlocked.",
      bookSlug: book.slug,
      bookTitle: book.title,
      purchaseId: purchase.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unable to verify payment. Please contact support." },
      { status: 500 }
    );
  }
}
