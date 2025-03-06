import { getAllSpaces } from "../database/db_space.js";
let currentPage = 1;
let spacesPerPage = window.innerWidth < 640 ? 3 : 6; // Nếu màn hình < 640px (mobile) thì 3, ngược lại thì 6

// Lắng nghe sự kiện thay đổi kích thước màn hình
window.addEventListener("resize", async () => {
  const newSpacesPerPage = window.innerWidth < 640 ? 3 : 6;
  if (newSpacesPerPage !== spacesPerPage) {
    spacesPerPage = newSpacesPerPage;
    currentPage = 1; // Reset về trang đầu
    await renderSpaces();
  }
});

async function renderSpaces() {
  const container = document.getElementById("space-container");
  const spaces = await getAllSpaces();
  // Ẩn container trước khi thay đổi nội dung
  container.classList.add("opacity-0");

  setTimeout(() => {
    container.innerHTML = ""; // Xóa nội dung cũ

    const start = (currentPage - 1) * spacesPerPage;
    const end = start + spacesPerPage;
    const currentSpaces = spaces.slice(start, end);

    currentSpaces.forEach((space) => {
      const div = document.createElement("div");
      div.className =
        "bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300";
      div.innerHTML = `
                <img src="${space.imageUrls[0]}" class="w-full h-60 object-cover rounded-lg" alt="${space.name}">
                <div class="p-4">
                    <h3 class="text-lg font-bold">${space.name}</h3>
                    <p class="text-gray-600 mt-2">${space.location}</p>
                </div>
            `;
      container.appendChild(div);
    });

    // Hiện container lại sau khi cập nhật nội dung
    container.classList.remove("opacity-0");
  }, 300);

  updatePagination();
}

function updatePagination() {
  const buttons = document.querySelectorAll(".page-btn");
  buttons.forEach((btn, index) => {
    btn.classList.remove("bg_darkbrowndirt", "text-white");
    btn.classList.add("bg-gray-200", "hover:bg-gray-300");

    if (index + 1 === currentPage) {
      btn.classList.add("bg_darkbrowndirt", "text-white");
      btn.classList.remove("bg-gray-200", "hover:bg-gray-300");
    }
  });
}

async function changePage(page) {
  if (page >= 1 && page <= 3) {
    currentPage = page;
    await renderSpaces();
  }
}

async function nextPage() {
  if (currentPage < 3) {
    currentPage++;
  } else {
    currentPage = 1; // Nếu đang ở trang 3, quay lại trang 1
  }
  await renderSpaces();
}
async function prevPage() {
  if (currentPage > 1) {
    currentPage--;
  } else {
    currentPage = 3; // Nếu đang ở trang 1, quay lại trang 3
  }
  await renderSpaces();
}
await renderSpaces();
window.changePage = changePage;
window.nextPage = nextPage;
window.prevPage = prevPage;

