import { createPayment } from "../database/db_payment.js";
document.addEventListener("DOMContentLoaded", function () {
  const bookingData = JSON.parse(localStorage.getItem("bookingData"));
  const data = JSON.parse(localStorage.getItem("data"));

  if (!bookingData || !data) {
    console.error("Không có dữ liệu booking!");
    return;
  }

  // Gán dữ liệu vào HTML
  document.getElementById("space-img").src = data.roomImg; // Gán ảnh
  document.getElementById(
    "booking-date"
  ).textContent = `Date: ${bookingData.date}`;
  document.getElementById(
    "booking-time"
  ).textContent = `Time: ${bookingData.timeStart} - ${bookingData.timeEnd}`;
  document.getElementById("space-name").textContent = data.roomLocation;
  document.getElementById("space-description").textContent =
    data.roomDescription;
  document.getElementById(
    "total-price"
  ).textContent = `${bookingData.totalAmount.toLocaleString()} $`;
  document.getElementById(
    "subtotal"
  ).textContent = `${bookingData.totalAmount.toLocaleString()} $`;

  // Giả sử thuế là 10% giá trị
  const tax = bookingData.totalAmount * 0.1;
  document.getElementById("tax").textContent = `${tax.toLocaleString()} $`;

  // Tổng tiền bao gồm thuế
  const finalTotal = bookingData.totalAmount + tax;
  document.getElementById(
    "final-total"
  ).textContent = `${finalTotal.toLocaleString()} $`;
});

document
  .getElementById("payment-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const cardNum = document.getElementById("card-number").value.trim();
    const expDate = document.getElementById("exp-date").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    const amount = document.getElementById("final-total");
    if (!cardNum || !expDate || !cvv) {
      return; // Dừng lại nếu thông tin thẻ chưa đầy đủ
    }

    const data = JSON.parse(localStorage.getItem("data"));
    const bookingId = data.bookingId;

    try {
      const res = await createPayment(bookingId,amount);
      
      if (res && res.status === "OK") {
        localStorage.removeItem("bookingData");
        localStorage.removeItem("data");
    
        let modal = document.getElementById("success-modal");
        modal.classList.remove("hidden", "opacity-0");
        modal.classList.add("opacity-100");
        modal.children[0].classList.add("scale-100");
      } else {
        alert("Lỗi thanh toán booking: " + (res?.message || "Không rõ nguyên nhân"));
      }
    } catch (error) {
      console.error("Lỗi khi lưu thanh toán:", error);
      alert("Lỗi hệ thống khi thanh toán!");
    }
  });
