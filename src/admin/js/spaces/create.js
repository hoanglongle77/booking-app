import {
  fetchSpacesRealTime,
  fetchCategories,
  saveSpace,
  uploadImageToServer,
} from "../../../database/db_space.js";

document.addEventListener("DOMContentLoaded", () => {
  const openPopupBtn = document.getElementById("open-add-popup");
  const popupContainer = document.getElementById("add-container");

  if (!openPopupBtn || !popupContainer) {
    console.error(
      "Lỗi: Không tìm thấy #open-add-popup hoặc #add-container trong DOM."
    );
    return;
  }

  openPopupBtn.addEventListener("click", () => {
    fetch("create.html")
      .then((response) => response.text())
      .then((html) => {
        popupContainer.innerHTML = html;
        popupContainer.classList.remove("hidden");
        initializeFormFunctionality();
      })
      .catch((error) => console.error("Lỗi khi tải create.html:", error));
  });

  popupContainer.addEventListener("click", (e) => {
    if (e.target === popupContainer) {
      popupContainer.classList.add("hidden");
    }
  });
});

async function initializeFormFunctionality() {
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
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách categories:", error);
  }

  const form = document.getElementById("add-space-form");
  const closePopupBtn = document.getElementById("close-popup");
  const cancelBtn = document.getElementById("cancel-btn");
  const imageInput = document.getElementById("space-images");
  const imagePreviewContainer = document.getElementById(
    "image-preview-container"
  );
  const popupContainer = document.getElementById("add-container");

  // Xóa event listener cũ nếu có
  if (form.submitHandler) {
    form.removeEventListener("submit", form.submitHandler);
  }

  // Tạo handler mới và lưu lại để có thể xóa sau này
  form.submitHandler = handleFormSubmit;
  form.addEventListener("submit", form.submitHandler);

  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", () =>
      popupContainer.classList.add("hidden")
    );
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () =>
      popupContainer.classList.add("hidden")
    );
  }

  if (imageInput) {
    imageInput.addEventListener("change", handleImagePreview);
  }

  function handleImagePreview(e) {
    const files = e.target.files;
    imagePreviewContainer.innerHTML = "";
    if (files.length > 0) {
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          displayImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function displayImagePreview(base64Image) {
    const previewDiv = document.createElement("div");
    previewDiv.className =
      "relative w-16 h-16 rounded overflow-hidden mr-2 mb-2";
    const img = document.createElement("img");
    img.src = base64Image;
    img.className = "w-full h-full object-cover";
    previewDiv.appendChild(img);
    imagePreviewContainer.appendChild(previewDiv);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

    const formData = new FormData(form);
    const selectedCategory = formData.get("category");

    // Kiểm tra nếu categoryId không hợp lệ
    if (!selectedCategory || selectedCategory.trim() === "") {
      alert("❌ Vui lòng chọn một danh mục trước khi thêm Space!");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      return;
    }

    try {
      // Lưu đường dẫn ảnh
      const images = [];
      if (imageInput.files.length > 0) {
        for (let file of imageInput.files) {
          const imageUrl = await uploadImageToServer(file);
          images.push(imageUrl);
        }
      }

      // Chuẩn bị dữ liệu Space
      const spaceData = {
        name: formData.get("name"),
        price_per_hour: Number.parseInt(formData.get("price")),
        description: formData.get("description"),
        status: formData.get("status") || "available", // Đảm bảo có giá trị mặc định
        imageUrl:
          images.length > 0 ? images : ["../../../assets/img/default.png"], // Đảm bảo luôn có ảnh
        location: formData.get("location"),
        created_at: new Date().toISOString(),
        category: selectedCategory, // Lưu categoryId vào object
      };

      // Lưu Space vào danh mục đã chọn
      await saveSpace(spaceData);

      alert("✅ Space đã được thêm thành công vào danh mục!");

      // Reset form và đóng popup
      form.reset();
      imagePreviewContainer.innerHTML = "";
      popupContainer.classList.add("hidden");

      // Reload trang để hiển thị dữ liệu mới
      window.location.reload();
    } catch (error) {
      console.error("❌ Lỗi khi lưu Space:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}
