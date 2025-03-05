document.addEventListener("DOMContentLoaded", async () => {
  // Xác định trang cần load từ URL
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page") || "dashboard"; // Mặc định là dashboard
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.href.includes(`page=${page}`)) {
      link.classList.add("bg-gray-800", "text-yellow-400", "font-semibold");
    }
  });
  // Load trang con vào #content
  fetch(`./${page}/index.html`)
    .then((res) => res.text())
    .then((data) => (document.getElementById("content").innerHTML = data))
    .catch(
      () =>
        (document.getElementById("content").innerHTML =
          "<p class='text-red-500'>Page not found!</p>")
    );
});
