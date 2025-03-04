import { db, ref, set, get } from "../config/firebase.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.1/+esm";

const usersRef = ref(db, "users");

// Thêm User
export async function createUser(name, email, phone, role = "customer") {
  if (!name || !email || !phone) {
    return { status: "ERROR", message: "Missing required fields" };
  }
  const userId = uuidv4();
  const userRef = ref(db, `users/${userId}`);
  const newUser = {
    name: name || "Unknown",
    email: email || "no-email@example.com",
    phone: phone || "N/A",
    role,
  };

  try {
    await set(userRef, newUser);
    console.log("User added successfully!");
    return { status: "OK", userId, newUser };
  } catch (error) {
    console.error("Error adding user:", error);
    return { status: "ERROR", message: error };
  }
}

// Lấy tất cả Users
export async function getUsers() {
  try {
    const snapshot = await get(usersRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Lấy User theo ID
export async function getUserById(userId) {
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
}
