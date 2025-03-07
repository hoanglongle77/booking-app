import { onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { db, ref, set, get } from "../config/firebase.js";

export function fetchSpacesRealTime(callback) {
  const spacesRef = ref(db, "categories"); // Lấy toàn bộ categories từ database
  onValue(spacesRef, (snapshot) => {
    const categoriesData = snapshot.val();
    if (!categoriesData) {
      console.warn("⚠ Không có dữ liệu categories!");
      callback([]);
      return;
    }
    let allSpaces = [];

    // Lặp qua từng category để lấy spaces
    Object.entries(categoriesData).forEach(([categoryId, category]) => {
      if (category.spaces) {
        Object.entries(category.spaces).forEach(([spaceId, space]) => {
          allSpaces.push({ id: spaceId, ...space });
        });
      }
    });

    console.log("✅ Danh sách spaces:", allSpaces);
    callback(allSpaces);
  });
}

export async function getCategories() {
  try {
    const categoriesRef = ref(db, "categories");
    const snapshot = await get(categoriesRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error("Lỗi khi lấy categories:", error);
    return {};
  }
}

// Lấy danh sách Spaces theo Category ID
export async function getSpaces(categoryId) {
  try {
    const spacesRef = ref(db, `categories/${categoryId}/spaces`);
    const snapshot = await get(spacesRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error(`Lỗi khi lấy spaces của category ${categoryId}:`, error);
    return {};
  }
}

export async function getSpaceById(categoryId, spaceId) {
  try {
    const spaceRef = ref(db, `categories/${categoryId}/spaces/${spaceId}`);
    const snapshot = await get(spaceRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error(
      `Lỗi khi lấy space ${spaceId} trong category ${categoryId}:`,
      error
    );
    return null;
  }
}

export async function getSeatBySpace(categoryId, spaceId) {
  try {
    const seatsRef = ref(
      db,
      `categories/${categoryId}/spaces/${spaceId}/seats`
    );
    const snapshot = await get(seatsRef);

    if (!snapshot.exists()) {
      console.log(`Không có ghế trong space ${spaceId}`);
      return [];
    }

    const seats = snapshot.val();
    return Object.keys(seats).map((seatId) => ({
      id: seatId,
      ...seats[seatId],
    }));
  } catch (error) {
    console.error(`Lỗi khi lấy ghế của space ${spaceId}:`, error);
    return [];
  }
}

// Lấy thông tin Seat theo ID
export async function getSeatById(categoryId, spaceId, seatId) {
  try {
    const seatRef = ref(
      db,
      `categories/${categoryId}/spaces/${spaceId}/seats/${seatId}`
    );
    const snapshot = await get(seatRef);

    if (!snapshot.exists()) {
      console.log(`Không tìm thấy seat ${seatId} trong space ${spaceId}`);
      return null;
    }

    return {
      id: seatId,
      ...snapshot.val(),
    };
  } catch (error) {
    console.error(`Lỗi khi lấy seat ${seatId} trong space ${spaceId}:`, error);
    return null;
  }
}
