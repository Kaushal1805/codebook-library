import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

export type PurchaseStatus = "pending" | "paid" | "failed" | "refunded";

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  amount: number;
  currency: string;
  status: PurchaseStatus;
  purchasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback for local development / testing without live Supabase DB connected
const memoryPurchases: Map<string, Purchase> = new Map();

function mapDbPurchase(row: any): Purchase {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    razorpaySignature: row.razorpay_signature,
    amount: Number(row.amount),
    currency: row.currency || "INR",
    status: row.status,
    purchasedAt: row.purchased_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function withTimeout<T = any>(promise: PromiseLike<T> | Promise<T>, timeoutMs = 1000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Supabase purchase timeout")), timeoutMs);
  });
  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

/**
 * Checks if a user has a verified 'paid' purchase for a specific book.
 */
export async function checkUserBookPurchase(
  userId: string,
  bookId: string,
  client?: any
): Promise<boolean> {
  if (!bookId) return false;

  // 0. Check browser localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("purchased_books");
      if (stored) {
        const list: string[] = JSON.parse(stored);
        if (list.includes(bookId)) return true;
      }
    } catch {
      // Ignore
    }
  }

  // 1. Check memory store fallback
  const memoryKey = `${userId}:${bookId}`;
  const mem = memoryPurchases.get(memoryKey);
  if (mem && mem.status === "paid") return true;

  // 2. Query Supabase
  try {
    const supabase = client || createClient();
    const { data, error } = await withTimeout(
      supabase
        .from("purchases")
        .select("id, status")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .eq("status", "paid")
        .maybeSingle()
    );

    if (!error && data) {
      return true;
    }
  } catch {
    // Ignore error
  }

  return false;
}

/**
 * Fetches all paid purchases for a user (used by My Library).
 */
export async function getUserPurchases(
  userId: string,
  client?: any
): Promise<Purchase[]> {
  if (!userId) return [];

  const results: Purchase[] = [];

  // Query Supabase
  try {
    const supabase = client || createClient();
    const { data, error } = await withTimeout(
      supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "paid")
        .order("purchased_at", { ascending: false })
    );

    if (!error && data && data.length > 0) {
      return data.map(mapDbPurchase);
    }
  } catch {
    // Ignore error
  }

  // Fallback to memory store for current user
  memoryPurchases.forEach((p) => {
    if (p.userId === userId && p.status === "paid") {
      results.push(p);
    }
  });

  return results;
}

/**
 * Records a pending purchase before opening Razorpay checkout.
 */
export async function createPendingPurchase(
  input: {
    userId: string;
    bookId: string;
    orderId: string;
    amount: number;
    currency?: string;
  },
  client?: any
): Promise<Purchase> {
  const newPurchase: Purchase = {
    id: `purch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    userId: input.userId,
    bookId: input.bookId,
    razorpayOrderId: input.orderId,
    amount: input.amount,
    currency: input.currency || "INR",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to memory store
  const memoryKey = `${input.userId}:${input.bookId}`;
  memoryPurchases.set(memoryKey, newPurchase);

  // 2. Save to Supabase using admin client (service role) to bypass RLS
  try {
    const admin = client || createAdminClient();
    const { data, error } = await admin
      .from("purchases")
      .insert({
        user_id: input.userId,
        book_id: input.bookId,
        razorpay_order_id: input.orderId,
        amount: input.amount,
        currency: input.currency || "INR",
        status: "pending",
      })
      .select("*")
      .single();

    if (!error && data) {
      return mapDbPurchase(data);
    }
  } catch {
    // If Supabase not running, memory fallback serves the request
  }

  return newPurchase;
}

/**
 * Marks a purchase as paid after server-side cryptographic signature verification.
 */
export async function markPurchasePaid(
  input: {
    orderId: string;
    paymentId: string;
    signature: string;
    userId: string;
    bookId: string;
  },
  client?: any
): Promise<Purchase | null> {
  const nowIso = new Date().toISOString();

  // 1. Update memory store
  const memoryKey = `${input.userId}:${input.bookId}`;
  const existing = memoryPurchases.get(memoryKey);
  const updatedPurchase: Purchase = {
    id: existing?.id || `purch_${Date.now()}`,
    userId: input.userId,
    bookId: input.bookId,
    razorpayOrderId: input.orderId,
    razorpayPaymentId: input.paymentId,
    razorpaySignature: input.signature,
    amount: existing?.amount || 0,
    currency: existing?.currency || "INR",
    status: "paid",
    purchasedAt: nowIso,
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso,
  };
  memoryPurchases.set(memoryKey, updatedPurchase);

  // 1.5 Sync to browser localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("purchased_books");
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(input.bookId)) {
        list.push(input.bookId);
        localStorage.setItem("purchased_books", JSON.stringify(list));
      }
    } catch {
      // Ignore
    }
  }

  // 2. Update Supabase via admin client
  try {
    const admin = client || createAdminClient();
    const { data, error } = await admin
      .from("purchases")
      .update({
        razorpay_payment_id: input.paymentId,
        razorpay_signature: input.signature,
        status: "paid",
        purchased_at: nowIso,
        updated_at: nowIso,
      })
      .eq("razorpay_order_id", input.orderId)
      .select("*")
      .single();

    if (!error && data) {
      return mapDbPurchase(data);
    }
  } catch {
    // Fallback on memory store
  }

  return updatedPurchase;
}
