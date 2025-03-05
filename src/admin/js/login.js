import { login, setCookie, generateToken } from "../database/db_auth.js";

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const res = await login(email, password);

    if (res.status === "OK") {
      const role = res.user.role;
      const token = generateToken(email, role);
      setCookie("authToken", token);
      alert("Đăng nhập thành công!");
      window.location.href = "../pages/index.html";
    } else {
      alert(res.message);
    }
  });
