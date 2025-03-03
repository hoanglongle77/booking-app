import { db, ref, set, get } from "../config/firebase.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.1/+esm";

const spacesRef = ref(db, "spaces");

export async function createSpace(type, description, seats = {}) {
  const spaceId = uuidv4();
  const spaceRef = ref(db, `spaces/${spaceId}`);
  const newSpace = { type, description, seats };

  try {
    await set(spaceRef, newSpace);
    console.log("Space added successfully!");
  } catch (error) {
    console.error("Error adding space:", error);
  }
}

export async function getSpaces() {
  try {
    const snapshot = await get(spacesRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error("Error fetching spaces:", error);
  }
}
export async function getAllSeat() {
  try {
    const spacesRef = ref(db, "spaces");
    const snapshot = await get(spacesRef);

    if (!snapshot.exists()) {
      console.log("Không có dữ liệu chỗ ngồi!");
      return [];
    }

    const spaces = snapshot.val();
    let seats = [];

    Object.keys(spaces).forEach((spaceId) => {
      const space = spaces[spaceId];
      if (space.seats) {
        Object.keys(space.seats).forEach((seatId) => {
          seats.push({
            id: seatId,
            spaceId: spaceId,
            ...space.seats[seatId],
          });
        });
      }
    });

    return seats;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả chỗ ngồi:", error);
    return [];
  }
}
export async function getSeatBySpace(spaceId) {
  try {
    
    const spaceRef = ref(db, `spaces/${spaceId}/seats`);
    const snapshot = await get(spaceRef);

    if (!snapshot.exists()) {
      console.log(`Không có dữ liệu chỗ ngồi cho spaceId: ${spaceId}`);
      return [];
    }

    const seats = snapshot.val();
    return Object.keys(seats).map((seatId) => ({
      id: seatId,
      spaceId: spaceId,
      ...seats[seatId],
    }));
  } catch (error) {
    console.error(`Lỗi khi lấy chỗ ngồi của spaceId: ${spaceId}`, error);
    return [];
  }
}
export async function getSeatById(spaceId, seatId) {
  try {
    console.log(`${spaceId}, ${seatId}`);
    const seatRef = ref(db, `spaces/${spaceId}/seats/${seatId}`);
    const snapshot = await get(seatRef);

    if (!snapshot.exists()) {
      console.log(
        `Không tìm thấy ghế có ID: ${seatId} trong không gian ${spaceId}`
      );
      return null;
    }

    return {
      id: seatId,
      spaceId: spaceId,
      ...snapshot.val(),
    };
  } catch (error) {
    console.error(
      `Lỗi khi lấy ghế ${seatId} trong không gian ${spaceId}:`,
      error
    );
    return null;
  }
}

export async function getSpaceById(spaceId) {
  try {
    const snapshot = await get(ref(db, `spaces/${spaceId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching space:", error);
  }
}
