let newBooking = null;
let userName = null;
let roomLocation = null;
let roomDescription = null;
let roomImg = null;

document.addEventListener("DOMContentLoaded", function () {
  const bookingData = JSON.parse(localStorage.getItem("bookingData"));
  const data = JSON.parse(localStorage.getItem("data"));

  if (!bookingData || !data) {
    console.error("Không có dữ liệu booking!");
    return;
  }

  // Gán dữ liệu vào HTML
  document.getElementById("space-img").src = data.roomImg; // Gán ảnh
  document.getElementById("booking-date").textContent = `Date: ${bookingData.date}`;
  document.getElementById("booking-time").textContent = `Time: ${bookingData.timeStart} - ${bookingData.timeEnd}`;
  document.getElementById("space-name").textContent = data.roomLocation;
  document.getElementById("space-description").textContent = data.roomDescription;
  document.getElementById("total-price").textContent = `${bookingData.totalAmount.toLocaleString()} $`;
  document.getElementById("subtotal").textContent = `${bookingData.totalAmount.toLocaleString()} $`;

  // Giả sử thuế là 10% giá trị
  const tax = bookingData.totalAmount * 0.1;
  document.getElementById("tax").textContent = `${tax.toLocaleString()} $`;

  // Tổng tiền bao gồm thuế
  const finalTotal = bookingData.totalAmount + tax;
  document.getElementById("final-total").textContent = `${finalTotal.toLocaleString()} $`;
});