import { fetchSpacesRealTime } from "../database/db_space.js"; // Đảm bảo đường dẫn đúng

const spacesPerPage = 6; // Số lượng spaces hiển thị trên mỗi trang
let currentPage = 1;
let allSpaces = []; // Dữ liệu từ Firebase

document.addEventListener("DOMContentLoaded", () => {
  fetchSpacesRealTime((spaces) => {
    allSpaces = spaces; // Lưu dữ liệu vào mảng
    renderSpaces(); // Gọi render khi có dữ liệu
  });
});

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
      "cursor-pointer", // Hiển thị con trỏ để biết có thể click
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

  container.innerHTML = `
    <button id="prevBtn" class="px-4 py-2 bg_darkbrowndirt text-white rounded disabled:opacity-50" ${
      currentPage === 1 ? "disabled" : ""
    }>Previous</button>
    <span class="px-4">Page ${currentPage} of ${Math.ceil(
    allSpaces.length / spacesPerPage
  )}</span>
    <button id="nextBtn" class="px-4 py-2 bg_darkbrowndirt text-white rounded disabled:opacity-50" ${
      currentPage === Math.ceil(allSpaces.length / spacesPerPage)
        ? "disabled"
        : ""
    }>Next</button>
  `;

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderSpaces();
    }
  });

  document.getElementById("nextBtn")?.addEventListener("click", () => {
    if (currentPage < Math.ceil(allSpaces.length / spacesPerPage)) {
      currentPage++;
      renderSpaces();
    }
  });
}
