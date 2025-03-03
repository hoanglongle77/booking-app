import { getSpaces, getCategories, getSpaceById, getSeatBySpace, getSeatById } from "../database/db_space.js";

let selectedCategoryId = null;
let selectedSpaceId = null;

// Load danh sách category
const loadCategories = async () => {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = '<option value="">Choose a category</option>';

  const categories = await getCategories();
  if (!categories) return;

  Object.keys(categories).forEach((categoryId) => {
    const category = categories[categoryId];
    const option = document.createElement("option");
    option.value = categoryId;
    option.textContent = category.name; // Sử dụng 'name' thay vì 'type'
    categorySelect.appendChild(option);
  });
};

// Load danh sách space theo category được chọn
const loadSpaces = async (categoryId) => {
  const spaceDiv = document.getElementById("space");
  spaceDiv.innerHTML = '<label class="block mb-2" for="spaceSelect">Space</label><select class="w-full bg-white p-2 border border-gray-300 rounded" id="spaceSelect" required><option value="">Choose a space</option></select>';

  if (!categoryId) return;

  const categories = await getCategories();
  const category = categories[categoryId];

  if (!category?.spaces) return;

  const spaceSelect = document.getElementById("spaceSelect");
  
  Object.keys(category.spaces).forEach((spaceId) => {
    const space = category.spaces[spaceId];
    const option = document.createElement("option");
    option.value = spaceId;
    option.textContent = space.name;
    spaceSelect.appendChild(option);
  });

  // Lắng nghe sự kiện khi chọn space
  spaceSelect.addEventListener("change", async (event) => {
    selectedSpaceId = event.target.value;
    await loadSeats(selectedSpaceId);
  });
};

// Load danh sách seat khi chọn space
const loadSeats = async (spaceId) => {
  const seatDiv = document.getElementById("seat");
  seatDiv.innerHTML = ""; // Xóa dữ liệu cũ

  if (!spaceId) return;

  const seats = await getSeatBySpace(selectedCategoryId, spaceId);
  if (!seats.length) {
    seatDiv.innerHTML = "<p>Không có ghế nào khả dụng.</p>";
    return;
  }

  seatDiv.innerHTML = `
    <div class="mb-4">
      <label class="block mb-2" for="seatSelect">Seat</label>
      <select class="w-full bg-white p-2 border border-gray-300 rounded" id="seatSelect" required>
        <option value="">Chọn</option>
      </select>
    </div>
  `;

  const seatSelect = document.getElementById("seatSelect");

  seats.forEach((seat) => {
    let option = document.createElement("option");
    option.value = seat.id;
    option.textContent = `${seat.name} - ${seat.location}`;
    seatSelect.appendChild(option);
  });

  seatSelect.addEventListener("change", async (event) => {
    loadSeatDetails(spaceId, event.target.value);
  });
};

// Hiển thị thông tin ghế khi chọn seat
const loadSpaceDetails = async (categoryId, spaceId) => {
  if (!categoryId || !spaceId) return;

  const space = await getSpaceById(categoryId, spaceId);
  if (!space) {
    console.log("Không tìm thấy không gian.");
    return;
  }

  // Cập nhật thông tin space vào UI
  document.getElementById("img_space").src = space.imageUrls || "https://via.placeholder.com/400x300";
  document.getElementById("price_space").textContent = space.price_per_hour ? `${space.price_per_hour}` : "Free";
  document.getElementById("description_space").textContent = space.location || "No description available";
};

document.getElementById("space").addEventListener("change", async (event) => {
  selectedSpaceId = event.target.value;
  await loadSpaceDetails(selectedCategoryId, selectedSpaceId);
});

// Xử lý sự kiện chọn category
document.getElementById("category").addEventListener("change", async (event) => {
  selectedCategoryId = event.target.value;
  await loadSpaces(selectedCategoryId);
});

// Load danh sách category khi trang web tải
document.addEventListener("DOMContentLoaded", loadCategories);
