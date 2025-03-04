import { db, ref, set, get } from "../config/firebase.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.1/+esm";

const bookingsRef = ref(db, "bookings");

export async function createBooking(
  userId,
  roomId,
  date,
  timeStart,
  timeEnd,
  totalAmount
) {
  const bookingId = uuidv4();
  const bookingRef = ref(db, `bookings/${bookingId}`);
  if (!userId || !roomId || !date || !timeStart || !timeEnd || !totalAmount) {
    alert("missinging item");
    return { status: "ERROR" };
  }
  const newBooking = {
    userId,
    roomId,
    date,
    timeEnd,
    timeStart,
    status: "pending",
    totalAmount,
    paidAmount: 0,
    remainingAmount: totalAmount,
  };

  try {
    await set(bookingRef, newBooking);
    console.log("Booking added successfully!");
    return { status: "OK", newBooking, bookingId };
  } catch (error) {
    console.error("Error adding booking:", error);
    return { status: "ERROR" };
  }
}

export async function getBookings() {
  try {
    const snapshot = await get(bookingsRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

export async function getBookingById(bookingId) {
  try {
    const snapshot = await get(ref(db, `bookings/${bookingId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching booking:", error);
  }
}
