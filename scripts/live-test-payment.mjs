async function liveTestPayment() {
  console.log("=== 1. Starting Live Payment Test ===");
  
  // Step 1: Create Order
  console.log("-> Calling POST /api/payments/create-order for book-1 (SQL Interview Mastery ₹79)...");
  const orderRes = await fetch("http://localhost:3000/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ book_id: "book-1" }),
  });

  const orderData = await orderRes.json();
  console.log("Create Order Response Status:", orderRes.status);
  console.log("Order Data:", JSON.stringify(orderData, null, 2));

  if (!orderRes.ok || !orderData.orderId) {
    console.error("❌ Order creation failed");
    return;
  }
  console.log("✅ Step 1: Order Created Successfully with Order ID:", orderData.orderId);

  // Step 2: Verify Payment
  console.log("\n-> Calling POST /api/payments/verify to simulate payment verification...");
  const verifyRes = await fetch("http://localhost:3000/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: orderData.orderId,
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_signature: "sim_sig_valid",
      book_id: "book-1",
    }),
  });

  const verifyData = await verifyRes.json();
  console.log("Verify Response Status:", verifyRes.status);
  console.log("Verify Data:", JSON.stringify(verifyData, null, 2));

  if (verifyRes.ok && verifyData.success) {
    console.log("\n🎉 ALL TESTS PASSED: Payment was verified and book unlocked!");
  } else {
    console.error("❌ Payment verification failed");
  }
}

liveTestPayment().catch(console.error);
