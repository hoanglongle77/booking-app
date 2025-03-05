import { db, ref, set } from "../config/firebase.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.1/+esm";

const paymentsRef = ref(db, "payments");

export async function createPayment(bookingId, amount) {
  const paymentId = uuidv4();
  const paymentRef = ref(db, `payments/${paymentId}`);

  if (!bookingId || !amount) {
    console.error("Thiếu thông tin thanh toán!");
    return { status: "ERROR" };
  }

  const newPayment = {
    amount,
    bookingId,
    paymentMethod: "Deposit",
    paymentStatus: "paid", // Giả sử thanh toán thành công ngay lập tức
    paymentType: "Card",
    transactionDate: new Date().toISOString(),
  };

  try {
    await set(paymentRef, newPayment);
    console.log("Payment added successfully!");
    return { status: "OK", newPayment };
  } catch (error) {
    console.error("Error adding payment:", error);
    return { status: "ERROR" };
  }
}

export async function getPayments() {
  try {
    const snapshot = await get(paymentsRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thanh toán:", error);
  }
}

export async function getPaymentById(paymentId) {
  try {
    const snapshot = await get(ref(db, `payments/${paymentId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thanh toán:", error);
  }
}
