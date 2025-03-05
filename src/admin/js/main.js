import { logout } from "../database/db_auth.js";
import { getUserRole } from "../database/db_auth.js";
function loadComponent(elementId, filePath, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", filePath, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      document.getElementById(elementId).innerHTML = xhr.responseText;
      if (callback) callback(); // Gọi callback sau khi load xong
    }
  };
  xhr.send();
}
document.addEventListener("DOMContentLoaded", async () => {
  const logoutContainer = document.getElementById("logout-container");

  if (logoutContainer && getUserRole() == "admin") {
    try {
      loadComponent("logout-container", "../components/logout-btn.html", () => {
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            logout(); // Gọi hàm đăng xuất
          });
        }
      });
    } catch (error) {
      console.error("Lỗi khi tải logout-btn:", error);
    }
  }
});
