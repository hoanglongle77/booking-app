import {
  fetchCategories,
  fetchSpaceById,
  updateSpace,
  uploadImageToServer,
} from "../../../database/db_space.js";

console.log("📢 Script edit.js đã được load.");

// Xóa event listener trùng lặp này để tránh đăng ký nhiều lần
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("📢 DOMContentLoaded được kích hoạt.");
//   const editButtons = document.querySelectorAll(".edit-btn");
//
//   editButtons.forEach((button) => {
//     button.addEventListener("click", () => {
//       const dataEdit = button.getAttribute("data-edit");
//       const [categoryId, spaceId] = dataEdit.split(":");
//       openEditPopup(categoryId, spaceId);
//     });
//   });
// });

export async function openEditPopup(categoryId, spaceId) {
  console.log(
    `📢 openEditPopup được gọi với categoryId=${categoryId}, spaceId=${spaceId}`
  );
  const popupContainer = document.getElementById("edit-container");
  if (!popupContainer) {
    console.error("❌ Không tìm thấy phần tử 'edit-container'.");
    return;
  }

  try {
    const response = await fetch("space_edit.html");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    popupContainer.innerHTML = await response.text();
    popupContainer.classList.remove("hidden");

    // Thêm nút đóng popup
    const closeButton = document.createElement("button");
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.className =
      "absolute top-3 right-3 text-gray-500 hover:text-gray-700";
    closeButton.addEventListener("click", () => {
      popupContainer.classList.add("hidden");
    });
    popupContainer.querySelector("div").appendChild(closeButton);

    await initializeEditForm(categoryId, spaceId);
  } catch (error) {
    console.error("❌ Lỗi khi tải space_edit.html:", error);
  }
}

async function initializeEditForm(categoryId, spaceId) {
  const categorySelect = document.getElementById("category-select");
  if (!categorySelect) {
    console.error("❌ Không tìm thấy thẻ <select> category!");
    return;
  }

  try {
    const categories = await fetchCategories();
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.value = categoryId;
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách categories:", error);
  }

  const space = await fetchSpaceById(categoryId, spaceId);
  if (!space) {
    console.error("❌ Không tìm thấy space để chỉnh sửa!");
    return;
  }

  const form = document.getElementById("edit-space-form");
  form.querySelector('input[name="name"]').value = space.name;
  form.querySelector('input[name="price"]').value = space.price_per_hour;
  form.querySelector('textarea[name="description"]').value = space.description;
  form.querySelector('input[name="location"]').value = space.location;
  categorySelect.value = categoryId;

  const imagePreviewContainer = document.getElementById(
    "image-preview-container"
  );
  imagePreviewContainer.innerHTML = "";

  if (Array.isArray(space.imageUrl) && space.imageUrl.length > 0) {
    space.imageUrl.forEach((imgUrl) => {
      const previewDiv = document.createElement("div");
      previewDiv.className =
        "relative w-16 h-16 rounded overflow-hidden mr-2 mb-2";

      const img = document.createElement("img");
      img.src = imgUrl;
      img.className = "w-full h-full object-cover";

      // Xử lý lỗi ảnh không tồn tại
      img.onerror = () => {
        console.warn(`⚠️ Ảnh không hợp lệ: ${imgUrl}, dùng ảnh mặc định.`);
        img.src = "../../../assets/img/1.png"; // Ảnh mặc định
      };

      previewDiv.appendChild(img);
      imagePreviewContainer.appendChild(previewDiv);
    });
  } else {
    console.warn("⚠️ Không có ảnh nào, dùng ảnh mặc định.");
    const defaultDiv = document.createElement("div");
    defaultDiv.className =
      "relative w-16 h-16 rounded overflow-hidden mr-2 mb-2";
    const defaultImg = document.createElement("img");
    defaultImg.src = "../../../assets/img/default.png";
    defaultImg.className = "w-full h-full object-cover";
    defaultDiv.appendChild(defaultImg);
    imagePreviewContainer.appendChild(defaultDiv);
  }

  // Xóa event listener cũ nếu có
  if (form.submitHandler) {
    form.removeEventListener("submit", form.submitHandler);
  }

  // Tạo handler mới và lưu lại để có thể xóa sau này
  form.submitHandler = (e) =>
    handleEditFormSubmit(e, spaceId, categoryId, space.imageUrl);
  form.addEventListener("submit", form.submitHandler);
}

async function handleEditFormSubmit(e, spaceId, oldCategoryId, oldImages) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

  const formData = new FormData(form);
  const selectedCategory = formData.get("category");

  if (!selectedCategory || selectedCategory.trim() === "") {
    alert("❌ Vui lòng chọn một danh mục trước khi cập nhật Space!");
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    return;
  }

  try {
    const imageInput = document.getElementById("space-images");
    let images = oldImages || [];

    if (imageInput.files.length > 0) {
      images = [];
      for (const file of imageInput.files) {
        const imageUrl = await uploadImageToServer(file);
        images.push(imageUrl);
      }
    }

    const updatedSpaceData = {
      name: formData.get("name"),
      price_per_hour: Number.parseInt(formData.get("price")),
      description: formData.get("description"),
      status: formData.get("status") || "available",
      imageUrl: images,
      location: formData.get("location"),
      category: selectedCategory,
    };

    if (selectedCategory !== oldCategoryId) {
      console.log(
        `📢 Space di chuyển từ category ${oldCategoryId} sang ${selectedCategory}`
      );
    }

    // Đợi cập nhật hoàn tất
    const updateSuccess = await updateSpace(spaceId, updatedSpaceData);

    if (updateSuccess) {
      alert("✅ Space đã được cập nhật thành công!");

      // Tìm card space cần cập nhật trong DOM
      const updatedCard = document.querySelector(
        `[data-space-id="${oldCategoryId}:${spaceId}"]`
      );

      if (updatedCard) {
        console.log("✅ Tìm thấy card cần cập nhật trong DOM");

        // Cập nhật các phần tử trong card
        const nameElement = updatedCard.querySelector("h3");
        const priceElement = updatedCard.querySelector(
          ".text-gray-700.font-semibold"
        );
        const descriptionElement = updatedCard.querySelector("p.text-gray-600");
        const imgElement = updatedCard.querySelector("img");
        const locationElement = updatedCard.querySelector(
          ".text-gray-700:not(.font-semibold)"
        );
        const statusElement = updatedCard.querySelector(
          ".absolute.top-2.left-2"
        );

        if (nameElement) nameElement.textContent = updatedSpaceData.name;

        if (priceElement) {
          priceElement.textContent = `${updatedSpaceData.price_per_hour.toLocaleString()}đ/hour`;
        }

        if (descriptionElement) {
          descriptionElement.textContent = updatedSpaceData.description;
        }

        if (locationElement) {
          locationElement.textContent = updatedSpaceData.location;
        }

        // Cập nhật trạng thái
        if (statusElement) {
          const statusColor =
            updatedSpaceData.status === "available"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800";

          statusElement.className = `absolute top-2 left-2 ${statusColor} px-2 py-1 rounded-full text-xs font-medium`;
          statusElement.textContent =
            updatedSpaceData.status === "available"
              ? "Available"
              : "Unavailable";
        }

        // Cập nhật ảnh nếu có
        if (imgElement && updatedSpaceData.imageUrl.length > 0) {
          imgElement.src = updatedSpaceData.imageUrl[0];
        }
      } else {
        console.warn(
          `⚠️ Không tìm thấy thẻ card có data-space-id="${oldCategoryId}:${spaceId}"`
        );
        // Nếu không tìm thấy card, có thể cần reload trang
        window.location.reload();
      }

      // Đóng popup sau khi cập nhật thành công
      document.getElementById("edit-container").classList.add("hidden");
    }
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật Space:", error);
    alert("Đã xảy ra lỗi, vui lòng thử lại!");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}
