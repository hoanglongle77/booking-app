document.addEventListener("DOMContentLoaded", function () {
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

  // Load header và gọi initHeader() sau khi tải xong
  loadComponent("header-placeholder", "../components/header.html", function () {
    initHeader(); // Chỉ gọi khi header đã tải xong
  });

  loadComponent("footer-placeholder", "../components/footer.html");
  loadComponent("cta-placeholder", "../components/cta.html");

  function initHeader() {

    // Lấy các phần tử của menu
    const menuBtn = document.getElementById("menu-btn");
    const closeMenuBtn = document.getElementById("close-menu");
    const menu = document.getElementById("menu");

    if (!menuBtn || !menu || !closeMenuBtn) {
      console.error("❌ Không tìm thấy phần tử menu!");
      return;
    }

    // Mở menu
    menuBtn.addEventListener("click", function () {
      menu.classList.remove("translate-x-full"); // Hiện menu từ phải
    });

    // Đóng menu
    closeMenuBtn.addEventListener("click", function () {
      menu.classList.add("translate-x-full"); // Ẩn menu
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener("click", function (e) {
      if (
        !menu.contains(e.target) &&
        e.target !== menuBtn &&
        !menuBtn.contains(e.target)
      ) {
        menu.classList.add("translate-x-full");
      }
    });
  }
});
