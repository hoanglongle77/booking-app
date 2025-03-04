// let currentPage = 1;
// let spacesPerPage = window.innerWidth < 640 ? 3 : 6;
// let totalPages = 1;
// let allSpaces = []; // Lưu dữ liệu từ Firebase

// // Lắng nghe sự kiện thay đổi kích thước màn hình
// window.addEventListener("resize", () => {
//   const newSpacesPerPage = window.innerWidth < 640 ? 3 : 6;
//   if (newSpacesPerPage !== spacesPerPage) {
//     spacesPerPage = newSpacesPerPage;
//     currentPage = 1;
//     renderSpaces();
//   }
// });

// // Cập nhật số trang dựa trên dữ liệu thực tế
// function updateTotalPages() {
//   totalPages = Math.ceil(allSpaces.length / spacesPerPage);
// }

// // Hiển thị danh sách không gian làm việc
// function renderSpaces() {
//   const container = document.getElementById("space-container");

//   // Ẩn container trước khi cập nhật nội dung
//   container.classList.add("opacity-0");

//   setTimeout(() => {
//     container.innerHTML = ""; // Xóa nội dung cũ
//     const start = (currentPage - 1) * spacesPerPage;
//     const end = start + spacesPerPage;
//     const currentSpaces = allSpaces.slice(start, end);

//     currentSpaces.forEach((space) => {
//       const div = document.createElement("div");
//       div.className =
//         "bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300";
//       div.innerHTML = `
//         <img src="${space.img}" class="w-full h-60 object-cover rounded-lg" alt="${space.name}">
//         <div class="p-4">
//             <h3 class="text-lg font-bold">${space.name}</h3>
//             <p class="text-gray-600 mt-2">${space.description}</p>
//         </div>
//       `;
//       container.appendChild(div);
//     });

//     container.classList.remove("opacity-0");
//     updatePagination();
//   }, 300);
// }

// // Cập nhật trạng thái phân trang
// function updatePagination() {
//   const buttons = document.querySelectorAll(".page-btn");
//   buttons.forEach((btn, index) => {
//     btn.classList.remove("bg_darkbrowndirt", "text-white");
//     btn.classList.add("bg-gray-200", "hover:bg-gray-300");

//     if (index + 1 === currentPage) {
//       btn.classList.add("bg_darkbrowndirt", "text-white");
//       btn.classList.remove("bg-gray-200", "hover:bg-gray-300");
//     }
//   });
// }

// // Thay đổi trang
// function changePage(page) {
//   if (page >= 1 && page <= totalPages) {
//     currentPage = page;
//     renderSpaces();
//   }
// }

// // Chuyển sang trang tiếp theo
// function nextPage() {
//   if (currentPage < totalPages) {
//     currentPage++;
//   } else {
//     currentPage = 1; // Quay lại trang đầu
//   }
//   renderSpaces();
// }

// // Quay lại trang trước
// function prevPage() {
//   if (currentPage > 1) {
//     currentPage--;
//   } else {
//     currentPage = totalPages; // Quay về trang cuối
//   }
//   renderSpaces();
// }

// export {
//   renderSpaces,
//   changePage,
//   nextPage,
//   prevPage,
//   allSpaces,
//   updateTotalPages,
// };

import {
  getDatabase,
  ref,
  query,
  orderByKey,
  limitToFirst,
  limitToLast,
  startAt,
  endAt,
  get,
} from "firebase/database";

const db = getDatabase();
const itemsPerPage = 5; // Số lượng item mỗi trang
let lastKey = null; // Key cuối cùng của trang hiện tại
let firstKey = null; // Key đầu tiên của trang hiện tại
let currentPage = 1;
const fetchSpaces = async (isNext = true) => {
  let dbRef = ref(db, "spaces");
  let spacesQuery;

  if (isNext) {
    if (lastKey) {
      // Lấy trang tiếp theo
      spacesQuery = query(
        dbRef,
        orderByKey(),
        startAt(lastKey),
        limitToFirst(itemsPerPage + 1)
      );
    } else {
      // Lấy trang đầu tiên
      spacesQuery = query(dbRef, orderByKey(), limitToFirst(itemsPerPage));
    }
  } else {
    if (firstKey) {
      // Lấy trang trước
      spacesQuery = query(
        dbRef,
        orderByKey(),
        endAt(firstKey),
        limitToLast(itemsPerPage + 1)
      );
    } else {
      return;
    }
  }

  const snapshot = await get(spacesQuery);
  const data = snapshot.val();

  if (data) {
    let items = Object.entries(data).map(([id, value]) => ({ id, ...value }));

    if (isNext) {
      lastKey = items[items.length - 1]?.id; // Key cuối cùng
      firstKey = items[0]?.id; // Key đầu tiên
    } else {
      lastKey = items[1]?.id; // Bỏ phần tử cuối vì nó trùng với phần tử đầu trang trước
      firstKey = items[0]?.id;
    }

    if (items.length === itemsPerPage + 1) {
      items.pop(); // Xóa item cuối cùng (trùng trang tiếp theo)
    }

    currentPage += isNext ? 1 : -1;
    renderSpaces(items);
  }
};
const renderSpaces = (spaces) => {
  const list = document.getElementById("spaceList");
  list.innerHTML = "";
  spaces.forEach((space) => {
    const li = document.createElement("li");
    li.textContent = `${space.name} - ${space.location}`;
    list.appendChild(li);
  });

  document.getElementById("pageNumber").innerText = `Trang ${currentPage}`;
};
