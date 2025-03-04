import { fetchSpacesRealTime } from "../database/db_space.js"; // Đảm bảo đường dẫn đúng

let spacesPerPage = getSpacesPerPage(); // Xác định số item mỗi trang
let currentPage = 1;
let allSpaces = []; // Dữ liệu từ Firebase

document.addEventListener("DOMContentLoaded", () => {
  fetchSpacesRealTime((spaces) => {
    allSpaces = spaces; // Lưu dữ liệu vào mảng
    renderSpaces(); // Gọi render khi có dữ liệu
  });

  // Lắng nghe sự kiện thay đổi kích thước màn hình
  window.addEventListener("resize", handleResize);
});

function getSpacesPerPage() {
  return window.innerWidth <= 768 ? 3 : 6; // Mobile: 3, Desktop: 6
}

function handleResize() {
  const newSpacesPerPage = getSpacesPerPage();
  if (newSpacesPerPage !== spacesPerPage) {
    spacesPerPage = newSpacesPerPage;
    currentPage = 1; // Reset về trang đầu
    renderSpaces();
  }
}

function renderSpaces() {
  const container = document.getElementById("space-container");
  const paginationContainer = document.getElementById("pagination");

  if (!container) {
    console.error(
      "❌ Không tìm thấy phần tử #space-container. Kiểm tra lại index.html!"
    );
    return;
  }

  // Tính toán index của dữ liệu cần hiển thị
  const startIndex = (currentPage - 1) * spacesPerPage;
  const endIndex = startIndex + spacesPerPage;
  const spacesToShow = allSpaces.slice(startIndex, endIndex);

  // Xóa nội dung cũ trước khi render
  container.innerHTML = "";

  spacesToShow.forEach((space) => {
    const spaceCard = document.createElement("div");
    spaceCard.classList.add(
      "bg-white",
      "rounded-lg",
      "shadow-md",
      "overflow-hidden",
      "transition-transform",
      "duration-300",
      "cursor-pointer",
      "hover:scale-105"
    );

    spaceCard.innerHTML = `
      <img src="${space.imageUrl}" class="w-full h-60 object-cover rounded-lg">
      <div class="p-4">
        <h3 class="text-lg font-bold">${space.name}</h3>
        <p class="text-gray-600 mt-2">${space.description}</p>
      </div>
    `;

    // Thêm sự kiện click để chuyển trang
    spaceCard.addEventListener("click", () => {
      window.location.href = "confirm.html"; // Chuyển hướng trang ngay lập tức
    });

    container.appendChild(spaceCard);
  });

  // Cập nhật nút phân trang
  renderPagination(paginationContainer);
}

function renderPagination(container) {
  if (!container) return;

  const totalPages = Math.ceil(allSpaces.length / spacesPerPage);

  container.innerHTML = `
    <button id="prevBtn" class="px-4 py-2 bg_darkbrowndirt text-white rounded disabled:opacity-50" ${
      currentPage === 1 ? "disabled" : ""
    }>
      Previous
    </button>
    <span class="px-4">Page ${currentPage} of ${totalPages}</span>
    <button id="nextBtn" class="px-4 py-2 bg_darkbrowndirt text-white rounded disabled:opacity-50" ${
      currentPage === totalPages ? "disabled" : ""
    }>
      Next
    </button>
  `;

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderSpaces();
    }
  });

  document.getElementById("nextBtn")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderSpaces();
    }
  });
}
