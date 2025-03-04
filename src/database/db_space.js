import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { db } from "../config/firebase.js"; // Import từ config chuẩn

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
