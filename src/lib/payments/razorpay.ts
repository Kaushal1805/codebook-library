import crypto from "crypto";
import Razorpay from "razorpay";

export interface RazorpayOrderResult {
  id: string;
  amount: number; // in paise
  currency: string;
  receipt?: string;
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export const razorpayInstance =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

/**
 * Creates an order via Razorpay API.
 * Uses authoritative amount in Rupees, converting to Paise (amount * 100).
 */
export async function createRazorpayOrder({
  amountInRupees,
  receipt,
  notes,
}: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResult> {
  const amountInPaise = Math.round(amountInRupees * 100);

  // If Razorpay instance is configured, call official SDK
  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || receipt,
      };
    } catch (err: any) {
      console.error("[Razorpay SDK] Order creation error:", err?.error || err);
      throw new Error(err?.error?.description || err?.message || "Failed to create Razorpay order");
    }
  }

  // Development simulation mode: generates valid simulated order for testing
  return {
    id: `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    amount: amountInPaise,
    currency: "INR",
    receipt,
  };
}

/**
 * Verifies Razorpay payment signature using HMAC SHA256.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!orderId || !paymentId || !signature) return false;

  // Development simulation bypass for automated test orders
  if (orderId.startsWith("order_sim_") && signature.startsWith("sim_sig_")) {
    return true;
  }

  if (!RAZORPAY_KEY_SECRET) return false;

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}

/**
 * Verifies Razorpay webhook event signature.
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  if (!signature || !rawBody) return false;
  const secret = RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}
