import { db, ref, set, get } from "../config/firebase.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.1/+esm";

const paymentsRef = ref(db, "payments");

// Thêm Payment
export async function createPayment(bookingId, amount, currency, paymentMethod, paymentType) {
    const paymentId = uuidv4();
    const paymentRef = ref(db, `payments/${paymentId}`);
    const newPayment = {
        bookingId,
        amount,
        currency,
        paymentMethod,
        paymentStatus: "pending",
        paymentType,
        transactionDate: new Date().toISOString()
    };

    try {
        await set(paymentRef, newPayment);
        console.log("Payment added successfully!");
    } catch (error) {
        console.error("Error adding payment:", error);
    }
}

// Lấy tất cả Payments
export async function getPayments() {
    try {
        const snapshot = await get(paymentsRef);
        return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
        console.error("Error fetching payments:", error);
    }
}

// Lấy Payment theo ID
export async function getPaymentById(paymentId) {
    try {
        const snapshot = await get(ref(db, `payments/${paymentId}`));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error("Error fetching payment:", error);
    }
}
