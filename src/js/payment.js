import { db, ref, set } from "../config/firebase.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.1/+esm";

document
  .getElementById("payment-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const cardNum = document.getElementById("card-number").value.trim();
    const expDate = document.getElementById("exp-date").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    if (!cardNum || !expDate || !cvv) {
      return; // Dừng lại nếu thông tin thẻ chưa đầy đủ
    }

    const bookingData = JSON.parse(localStorage.getItem("data"));
    const bookingId = bookingData?.bookingId;
    const amount = JSON.parse(localStorage.getItem("bookingData"))?.totalAmount;

    if (!bookingId || !amount) {
      console.error("Thiếu thông tin bookingId hoặc totalAmount.");
      return;
    }

    const paymentId = uuidv4();
    const paymentRef = ref(db, `payments/${paymentId}`);
    const newPayment = {
        bookingId,
        cardNumber: cardNum, // Lưu số thẻ (hoặc mã hóa để bảo mật)
        amount,
        status: "paid",
        date: new Date().toISOString(),
    };
    console.log("Dữ liệu thanh toán:", JSON.stringify(newPayment));

    try {
      await set(paymentRef, newPayment);

      // Xóa dữ liệu đặt phòng khỏi localStorage
      localStorage.removeItem("bookingData");
      localStorage.removeItem("paymentData");

      // Hiển thị modal thành công
      let modal = document.getElementById("success-modal");
      modal.classList.remove("hidden", "opacity-0");
      modal.classList.add("opacity-100");
      modal.children[0].classList.add("scale-100");

    } catch (error) {
      console.error("Lỗi khi lưu thanh toán:", error);
    }
  });

