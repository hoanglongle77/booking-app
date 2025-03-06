import {
  ref,
  onValue,
  off,
  remove,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { db } from "../../../config/firebase.js";
import { openEditPopup } from "./edit.js";

// Global variables for stats
let totalSpaces = 0;
let availableSpaces = 0;
let unavailableSpaces = 0;
let currentDeleteInfo = null;
let isInitialLoad = true; // Thêm biến để theo dõi lần load đầu tiên

export function fetchSpacesRealTime() {
  const categoryContainer = document.getElementById("category-container");
  const loadingState = document.getElementById("loading-state");
  const emptyState = document.getElementById("empty-state");

  // Show loading state
  loadingState.classList.remove("hidden");
  categoryContainer.innerHTML = ""; // Clear before loading

  // Reset stats
  totalSpaces = 0;
  availableSpaces = 0;
  unavailableSpaces = 0;

  const categoriesRef = ref(db, "categories");
  // Hủy bỏ listener cũ trước khi đăng ký listener mới
  off(categoriesRef);

  onValue(categoriesRef, (snapshot) => {
    // Kiểm tra nếu đang trong quá trình xóa, bỏ qua cập nhật này
    if (currentDeleteInfo) {
      currentDeleteInfo = null;
      return;
    }

    // Nếu không phải lần load đầu tiên và không có thay đổi lớn, không render lại toàn bộ
    if (!isInitialLoad && snapshot.exists()) {
      // Chỉ cập nhật thống kê
      updateStats();
      return;
    }

    isInitialLoad = false; // Đánh dấu đã load xong lần đầu

    totalSpaces = 0;
    availableSpaces = 0;
    unavailableSpaces = 0;

    // Hide loading state
    loadingState.classList.add("hidden");

    const categoriesData = snapshot.val();
    if (!categoriesData) {
      console.warn("⚠ No categories data found!");
      emptyState.classList.remove("hidden");
      updateStats();
      return;
    }

    // Check if we have any spaces
    let hasSpaces = false;
    Object.values(categoriesData).forEach((category) => {
      if (category.spaces && Object.keys(category.spaces).length > 0) {
        hasSpaces = true;
      }
    });

    if (!hasSpaces) {
      emptyState.classList.remove("hidden");
      updateStats();
      return;
    }

    emptyState.classList.add("hidden");
    categoryContainer.innerHTML = ""; // Xóa nội dung cũ trước khi render lại

    Object.entries(categoriesData).forEach(([categoryId, category]) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "bg-white shadow-md rounded-xl overflow-hidden";

      const categoryHeader = document.createElement("div");
      categoryHeader.className =
        "cursor-pointer transition-colors duration-200 hover:bg-gray-50";

      // Count spaces in this category
      const spaceCount = category.spaces
        ? Object.keys(category.spaces).length
        : 0;

      categoryHeader.innerHTML = `
        <div class="p-5 flex justify-between items-center" data-category="${categoryId}">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <i class="fas fa-folder text-blue-600"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">${category.name}</h2>
              <p class="text-sm text-gray-500" data-count="${categoryId}">${spaceCount} space${
        spaceCount !== 1 ? "s" : ""
      }</p>
            </div>
          </div>
          <div class="transform transition-transform duration-200" id="arrow-${categoryId}">
            <i class="fas fa-chevron-down text-gray-400"></i>
          </div>
        </div>
      `;

      const spacesContainer = document.createElement("div");
      spacesContainer.id = `spaces-${categoryId}`;
      spacesContainer.className =
        "hidden border-t border-gray-100 p-5 space-y-4 transition-all duration-300";

      if (category.spaces && Object.keys(category.spaces).length > 0) {
        Object.entries(category.spaces).forEach(([spaceId, space]) => {
          // Update stats
          totalSpaces++;
          if (space.status === "available") {
            availableSpaces++;
          } else {
            unavailableSpaces++;
          }

          const spaceItem = document.createElement("div");
          spaceItem.className =
            "bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200";
          spaceItem.setAttribute("data-space-id", `${categoryId}:${spaceId}`);

          const statusColor =
            space.status === "available"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800";

          spaceItem.innerHTML = `
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/4 h-48 md:h-auto relative">
                <img src="../${space.imageUrl[0]}" alt="${
            space.name
          }" class="w-full h-full object-cover space-img">
                <div class="absolute top-2 left-2 ${statusColor} px-2 py-1 rounded-full text-xs font-medium">
                  ${space.status === "available" ? "Available" : "Unavailable"}
                </div>
              </div>
              <div class="p-5 md:w-3/4 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start">
                    <h3 class="text-lg font-bold text-gray-800 mb-2 space-name">${
                      space.name
                    }</h3>
                    <div class="flex space-x-2">
                      <button data-edit="${categoryId}:${spaceId}" class="edit-btn text-blue-600 hover:text-blue-800 transition-colors">
                        <i class="fas fa-edit"></i>
                      </button>
                      <div id="edit-container"  
class
=
"
hidden fixed inset-0 modal-overlay bg-opacity-50 flex justify-center items-center z-50
"
>
<
div
 
class
=
"
bg-white p-5 rounded-lg shadow-lg
"
>

    <!-- Nội dung của popup sẽ được load vào đây -->
  
</
div
></div>
                      <button data-delete="${categoryId}:${spaceId}" class="delete-btn text-red-600 hover:text-red-800 transition-colors">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                  <p class="text-gray-600 mb-4 space-description">${
                    space.description
                  }</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="flex items-center">
                      <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                      <span class="text-gray-700">${space.location}</span>
                    </div>
                    <div class="flex items-center">
                      <i class="fas fa-money-bill-wave text-gray-400 mr-2"></i>
                      <span class="text-gray-700 font-semibold space-price">${space.price_per_hour.toLocaleString()}đ/hour</span>
                    </div>
                  </div>
                </div>
                <div class="mt-4 flex justify-end">
                  <button class="view-details-btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          `;
          spacesContainer.appendChild(spaceItem);
        });
      } else {
        const emptyCategory = document.createElement("div");
        emptyCategory.className = "text-center py-6";
        emptyCategory.innerHTML = `
          <p class="text-gray-500">No spaces in this category</p>
          <button class="mt-2 text-blue-600 hover:text-blue-800 text-sm">
            + Add space to this category
          </button>
        `;
        spacesContainer.appendChild(emptyCategory);
      }

      categoryDiv.appendChild(categoryHeader);
      categoryDiv.appendChild(spacesContainer);
      categoryContainer.appendChild(categoryDiv);

      // Add event listener to toggle spaces
      categoryHeader.addEventListener("click", (e) => {
        const categoryId =
          e.currentTarget.querySelector("div").dataset.category;
        toggleSpaces(categoryId);
      });
    });

    // Đăng ký event listener cho các nút delete
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const [categoryId, spaceId] = btn.dataset.delete.split(":");
        showDeleteModal(categoryId, spaceId);
      });
    });

    // Đăng ký event listener cho các nút edit
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const [categoryId, spaceId] = btn.dataset.edit.split(":");
        openEditPopup(categoryId, spaceId);
      });
    });

    // Update stats display
    updateStats();
  });
}

function toggleSpaces(categoryId) {
  const spacesContainer = document.getElementById(`spaces-${categoryId}`);
  const arrow = document.getElementById(`arrow-${categoryId}`);

  if (spacesContainer.classList.contains("hidden")) {
    spacesContainer.classList.remove("hidden");
    arrow.classList.add("rotate-180");
  } else {
    spacesContainer.classList.add("hidden");
    arrow.classList.remove("rotate-180");
  }
}

function showDeleteModal(categoryId, spaceId) {
  const modal = document.getElementById("delete-modal");
  modal.classList.remove("hidden");

  // Store the current space to delete
  currentDeleteInfo = { categoryId, spaceId };
}

function deleteSpace(categoryId, spaceId) {
  console.log(
    `🗑️ Deleting space: categoryId=${categoryId}, spaceId=${spaceId}`
  );

  // Tìm phần tử trong DOM để xóa
  const spaceElement = document.querySelector(
    `[data-space-id="${categoryId}:${spaceId}"]`
  );

  if (spaceElement) {
    console.log("✅ Found element in UI, removing...");
    spaceElement.remove(); // Xóa phần tử khỏi DOM
    console.log("✅ Successfully removed from UI");

    // Cập nhật lại thống kê UI sau khi xóa
    updateSpaceCountUI(categoryId);
    totalSpaces--;
    if (spaceElement.querySelector(".bg-green-100")) {
      availableSpaces = Math.max(availableSpaces - 1, 0);
    } else {
      unavailableSpaces = Math.max(unavailableSpaces - 1, 0);
    }

    updateStats();
  } else {
    console.warn(
      `⚠️ Space element with ID ${categoryId}:${spaceId} not found in UI`
    );
  }

  // Sau khi xóa khỏi UI, xóa từ Firebase
  remove(ref(db, `categories/${categoryId}/spaces/${spaceId}`))
    .then(() => {
      console.log("✅ Successfully deleted from Firebase");
    })
    .catch((error) => {
      console.error("❌ Error deleting: ", error);
    });
}

function updateStats() {
  document.getElementById("total-spaces").textContent = totalSpaces;
  document.getElementById("available-spaces").textContent = availableSpaces;
  document.getElementById("unavailable-spaces").textContent = unavailableSpaces;
}

function updateSpaceCountUI(categoryId) {
  const countElement = document.querySelector(`[data-count="${categoryId}"]`);
  if (!countElement) return;

  let currentCount = Number.parseInt(countElement.innerText);
  if (isNaN(currentCount)) currentCount = 1; // Tránh lỗi NaN

  currentCount = Math.max(currentCount - 1, 0);
  countElement.innerText = `${currentCount} space${
    currentCount !== 1 ? "s" : ""
  }`;
}

// Xóa đoạn code này vì nó gây ra việc đăng ký event listener nhiều lần
// document.addEventListener("DOMContentLoaded", () => {
//   setTimeout(() => {
//     // Đợi danh sách load
//     attachEditEventListeners();
//   }, 500); // Chờ 500ms (có thể chỉnh lại)
// });

// function attachEditEventListeners() {
//   const editButtons = document.querySelectorAll(".edit-btn");
//   console.log(`📢 Tìm thấy ${editButtons.length} nút chỉnh sửa.`);
//
//   editButtons.forEach((button) => {
//     button.addEventListener("click", () => {
//       const dataEdit = button.getAttribute("data-edit");
//       const [categoryId, spaceId] = dataEdit.split(":");
//       openEditPopup(categoryId, spaceId);
//     });
//   });
// }

// Xóa event listener trùng lặp này
// document.addEventListener("click", (event) => {
//   const button = event.target.closest(".edit-btn");
//   if (!button) return; // Nếu không click vào edit-btn thì thoát
//
//   const dataEdit = button.getAttribute("data-edit");
//   const [categoryId, spaceId] = dataEdit.split(":");
//
//   console.log(`🟢 Đã click Edit: categoryId=${categoryId}, spaceId=${spaceId}`);
//   openEditPopup(categoryId, spaceId);
// });

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Search functionality
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterSpaces(searchTerm);
    });
  }

  // Delete modal buttons
  const cancelDelete = document.getElementById("cancel-delete");
  const confirmDelete = document.getElementById("confirm-delete");
  const deleteModal = document.getElementById("delete-modal");

  if (cancelDelete && confirmDelete && deleteModal) {
    cancelDelete.addEventListener("click", () => {
      deleteModal.classList.add("hidden");
      currentDeleteInfo = null;
    });

    confirmDelete.addEventListener("click", () => {
      if (currentDeleteInfo) {
        deleteSpace(currentDeleteInfo.categoryId, currentDeleteInfo.spaceId);
        deleteModal.classList.add("hidden");
        currentDeleteInfo = null;
      }
    });

    // Close modal when clicking outside
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) {
        deleteModal.classList.add("hidden");
        currentDeleteInfo = null;
      }
    });
  }
});

function filterSpaces(searchTerm) {
  const spaceElements = document.querySelectorAll("[id^='spaces-'] > div");
  let visibleCount = 0;

  spaceElements.forEach((spaceElement) => {
    const text = spaceElement.textContent.toLowerCase();
    const shouldShow = text.includes(searchTerm);

    if (shouldShow) {
      spaceElement.classList.remove("hidden");
      visibleCount++;

      // Make sure the parent category is visible
      const categoryId = spaceElement
        .closest("[id^='spaces-']")
        .id.replace("spaces-", "");
      if (
        document
          .getElementById(`spaces-${categoryId}`)
          .classList.contains("hidden")
      ) {
        toggleSpaces(categoryId);
      }
    } else {
      spaceElement.classList.add("hidden");
    }
  });

  // Show empty state if no results
  const emptyState = document.getElementById("empty-state");
  if (visibleCount === 0 && searchTerm !== "") {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }
}

// Chỉ gọi fetchSpacesRealTime một lần khi trang được load
document.addEventListener("DOMContentLoaded", () => {
  fetchSpacesRealTime();
});
