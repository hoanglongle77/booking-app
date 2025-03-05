document.addEventListener("DOMContentLoaded", async () => {
  // Xác định trang cần load từ URL
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page") || "dashboard"; // Mặc định là dashboard
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.href.includes(`page=${page}`)) {
      link.classList.add("bg-yellow-200", "text-green-100", "font-semibold");
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
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebarTitle = document.getElementById("sidebarTitle");
  const navTexts = document.querySelectorAll(".nav-text");

  // Toggle Sidebar
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("w-64");
    sidebar.classList.toggle("w-16");
    
    // Ẩn hoặc hiện chữ khi thu gọn
    if (sidebar.classList.contains("w-16")) {
      sidebarTitle.classList.add("hidden");
      navTexts.forEach((text) => text.classList.add("hidden"));
      toggleSidebar.classList.remove("left-64");
      toggleSidebar.classList.add("left-16");
    } else {
      sidebarTitle.classList.remove("hidden");
      navTexts.forEach((text) => text.classList.remove("hidden"));
      toggleSidebar.classList.remove("left-16");
      toggleSidebar.classList.add("left-64");
    }
  });
});

