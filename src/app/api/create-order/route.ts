import { NextRequest, NextResponse } from "next/server";
import { razorpayInstance } from "@/lib/payments/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, notes } = body;

    // Validate amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount must be at least 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    if (!razorpayInstance) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const order = await razorpayInstance.orders.create({
      amount: Math.round(numericAmount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json({
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err: any) {
    console.error("[Razorpay API] create-order error:", err);
    return NextResponse.json(
      { error: err?.error?.description || err?.message || "Internal Server Error creating Razorpay order." },
      { status: 500 }
    );
  }
}
