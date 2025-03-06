import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { db } from "../config/firebase.js"; // Import từ config chuẩn
const fetchCount = 0;

export function fetchSpacesRealTime(callback) {
  console.log("📢 fetchSpacesRealTime() được gọi!");

  const spacesRef = ref(db, "categories");

  // CHỈ LẤY DỮ LIỆU 1 LẦN
  get(spacesRef)
    .then((snapshot) => {
      const categoriesData = snapshot.val();
      if (!categoriesData) {
        console.warn("⚠ Không có dữ liệu categories!");
        callback([]);
        return;
      }

      const allSpaces = [];
      Object.entries(categoriesData).forEach(([categoryId, category]) => {
        if (category.spaces) {
          Object.entries(category.spaces).forEach(([spaceId, space]) => {
            allSpaces.push({ id: spaceId, categoryId, ...space });
          });
        }
      });

      console.log("✅ Danh sách spaces:", allSpaces);
      callback(allSpaces);
    })
    .catch((error) => {
      console.error("❌ Lỗi khi fetch dữ liệu:", error);
    });
}

// ✅ Hàm lấy danh sách categories (Trả về Promise thay vì callback)
export function fetchCategories() {
  return new Promise((resolve, reject) => {
    const categoriesRef = ref(db, "categories");

    get(categoriesRef)
      .then((snapshot) => {
        const categoriesData = snapshot.val();
        if (!categoriesData) {
          console.warn("⚠ Không có dữ liệu categories!");
          resolve([]); // Trả về danh sách rỗng nếu không có categories
          return;
        }

        const categories = [];
        Object.entries(categoriesData).forEach(([key, value]) => {
          categories.push({ id: key, name: value.name });
        });

        console.log("✅ Danh sách categories:", categories);
        resolve(categories);
      })
      .catch(reject);
  });
}

export async function uploadImageToServer(file) {
  return new Promise((resolve) => {
    const imagePath = `../assets/img/${Date.now()}_${file.name}`;
    resolve(imagePath);
  });
}

// Hàm lưu Space vào danh mục đã chọn
export async function saveSpace(spaceData) {
  try {
    const db = getDatabase();
    const categoryRef = ref(db, `categories/${spaceData.category}`);

    // Lấy dữ liệu category để kiểm tra
    const snapshot = await get(categoryRef);
    if (!snapshot.exists()) {
      throw new Error("Danh mục không tồn tại!");
    }

    // Tạo ID cho Space mới
    const spaceId = generateUniqueId(); // Hàm tạo ID ngẫu nhiên

    // Dữ liệu Space chỉ chứa các trường cần thiết
    const spaceRef = ref(
      db,
      `categories/${spaceData.category}/spaces/${spaceId}`
    );
    const spaceInfo = {
      name: spaceData.name,
      price_per_hour: spaceData.price_per_hour,
      description: spaceData.description,
      status: spaceData.status,
      imageUrl: spaceData.imageUrl,
      location: spaceData.location,
      created_at: spaceData.created_at,
    };

    // Cập nhật database
    await set(spaceRef, spaceInfo);

    console.log("✅ Space đã được lưu thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi lưu Space:", error);
    throw error;
  }
}

// Hàm tạo ID ngẫu nhiên cho Space
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 10); // VD: "a1b2c3d4e5"
}

export async function updateSpace(spaceId, spaceData) {
  try {
    const db = getDatabase();
    const spaceRef = ref(
      db,
      `categories/${spaceData.category}/spaces/${spaceId}`
    );

    // Cập nhật dữ liệu của space
    await set(spaceRef, {
      name: spaceData.name,
      price_per_hour: spaceData.price_per_hour,
      description: spaceData.description,
      status: spaceData.status,
      imageUrl: spaceData.imageUrl,
      location: spaceData.location,
    });

    console.log("✅ Space đã được cập nhật thành công!");
    return true; // Thêm return để biết khi nào cập nhật thành công
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật Space:", error);
    throw error;
  }
}

export async function fetchSpaceById(categoryId, spaceId) {
  const spaceRef = ref(db, `categories/${categoryId}/spaces/${spaceId}`);
  try {
    const snapshot = await get(spaceRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.error("🚨 Space không tồn tại!");
      return null;
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu space:", error);
    return null;
  }
}
