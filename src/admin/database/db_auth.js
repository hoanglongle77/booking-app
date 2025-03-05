import { db, ref, get } from "../../config/firebase.js";
import { Token } from "../config/auth-config.js";
export async function login(email, password) {
  const usersRef = ref(db, "users");
  console.log(`${email} and ${password}`);
  try {
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) {
      return { status: "ERROR", message: "Không tìm thấy người dùng!" };
    }

    const users = snapshot.val();
    let userFound = null;
    Object.keys(users).forEach((userId) => {
      console.log(`User: ${users[userId].email}, ${users[userId].password}`);
      if (
        users[userId].email === email &&
        users[userId].password == password &&
        users[userId].role === "admin"
      ) {
        userFound = { id: userId, ...users[userId] };
      }
    });

    if (!userFound) {
      return {
        status: "ERROR",
        message: "Email hoặc mật khẩu không chính xác!",
      };
    }
    localStorage.setItem("authUser", JSON.stringify(userFound));

    return { status: "OK", user: userFound };
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return { status: "ERROR", message: "Lỗi hệ thống!" };
  }
}

export function generateToken(email, role) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ email, role }));
  const signature = btoa(Token);

  return `${header}.${payload}.${signature}`;
}

export function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}
export function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}
export function getUserRole() {
  const token = getCookie("authToken");
  if (!token) return null; 

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null; 

    const payload = JSON.parse(atob(parts[1])); 
    return payload.role || null;
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
}
export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function logout() {
  deleteCookie("authToken"); 
  window.location.href = "../pages/login.html"; 
}
