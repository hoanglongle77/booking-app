let newBooking = null;
let userName = null;
let roomLocation = null;
let roomDescription = null;
document.addEventListener("DOMContentLoaded", () => {
  newBooking = JSON.parse(localStorage.getItem("bookingData"));
  const data = JSON.parse(localStorage.getItem("data"));
  userName = data.userName;
  roomLocation = data.roomLocation;
  roomDescription = data.roomDescription;
  if (newBooking) {
    document.getElementById(
        "name"
      ).textContent = userName;
    document.getElementById(
      "price"
    ).textContent = `${newBooking.totalAmount} VND`;
    document.getElementById(
      "time-start"
    ).textContent = `${newBooking.timeStart}`;
    document.getElementById("time-end").textContent = `${newBooking.timeEnd}`;
    document.getElementById("date").textContent = `${new Date(
      newBooking.date
    )}`;
    document.getElementById("location").textContent = roomLocation;
    document.getElementById("description").textContent = roomDescription;
  }
});
