import { getCookie, getUserRole } from "../database/db_auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const role = getUserRole();
  if (role !== "admin") {
    alert("Bạn không có quyền truy cập!");
    window.location.href = "../pages/login.html"; 
  }
});
