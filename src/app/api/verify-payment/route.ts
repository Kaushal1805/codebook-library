import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order_id = body.order_id || body.razorpay_order_id;
    const payment_id = body.payment_id || body.razorpay_payment_id;
    const razorpay_signature = body.signature || body.razorpay_signature;

    if (!order_id || !payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: order_id, payment_id, razorpay_signature." },
        { status: 400 }
      );
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: "Server error: RAZORPAY_KEY_SECRET is not configured." },
        { status: 500 }
      );
    }

    const payload = `${order_id}|${payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    );

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Signature verification failed. Payment not verified." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order_id,
      payment_id,
    });
  } catch (err: any) {
    console.error("[Razorpay API] verify-payment error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}
