import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { markPurchasePaid } from "@/lib/data/purchases";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature header." },
        { status: 400 }
      );
    }

    const rawBody = await request.text();

    // 1. Verify cryptographic webhook signature
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    // 2. Process payment.captured event for asynchronous state reconciliation
    if (event === "payment.captured" && paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};
      const userId = notes.user_id;
      const bookId = notes.book_id;

      if (orderId && userId && bookId) {
        const adminSupabase = createAdminClient();
        await markPurchasePaid(
          {
            orderId,
            paymentId,
            signature: `wh_reconciled_${Date.now()}`,
            userId,
            bookId,
          },
          adminSupabase
        );
      }
    }

    // 3. Process payment.failed event
    if (event === "payment.failed" && paymentEntity) {
      const orderId = paymentEntity.order_id;
      if (orderId) {
        try {
          const adminSupabase = createAdminClient();
          await adminSupabase
            .from("purchases")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("razorpay_order_id", orderId);
        } catch {
          // Ignore
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Error processing webhook." },
      { status: 500 }
    );
  }
}
