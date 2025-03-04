import {
  getSpaces,
  getCategories,
  getSpaceById,
} from "../database/db_space.js";
import { createBooking } from "../database/db_bookings.js";
import { createUser } from "../database/db_users.js";

let categories = null;
let space = null;
let selectedCategoryId = null;
let selectedSpaceId = null;

const getElement = (id) => document.getElementById(id);

const loadCategories = async () => {
  const categorySelect = getElement("category");
  categorySelect.innerHTML = '<option value="">Choose a category</option>';

  categories = await getCategories();
  if (!categories) return;

  Object.entries(categories).forEach(([categoryId, category]) => {
    categorySelect.appendChild(new Option(category.name, categoryId));
  });
};

const loadSpaces = async (categoryId) => {
  const spaceDiv = getElement("space");
  spaceDiv.innerHTML = `
    <label class="block mb-2" for="spaceSelect">Space</label>
    <select class="w-full bg-white p-2 border border-gray-300 rounded" id="spaceSelect" required>
      <option value="">Choose a space</option>
    </select>
  `;

  if (!categoryId || !categories?.[categoryId]?.spaces) return;

  const spaceSelect = getElement("spaceSelect");
  Object.entries(categories[categoryId].spaces).forEach(([spaceId, space]) => {
    spaceSelect.appendChild(new Option(space.name, spaceId));
  });

  spaceSelect.addEventListener("change", async (event) => {
    selectedSpaceId = event.target.value;
    await loadSpaceDetails(selectedCategoryId, selectedSpaceId);
  });
};

const loadSpaceDetails = async (categoryId, spaceId) => {
  if (!categoryId || !spaceId) return;

  space = await getSpaceById(categoryId, spaceId);
  if (!space) {
    console.log("Không tìm thấy không gian.");
    return;
  }

  getElement("img_space").src =
    space.imageUrls || "https://via.placeholder.com/400x300";
  getElement("price_space").textContent = space.price_per_hour
    ? `${space.price_per_hour}`
    : "Free";
  getElement("location_space").textContent =
    space.location || "No description available";
};

const calculateTimeDifference = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end - start) / (1000 * 60 * 60);
};

const makeBooking = async (
  firstName,
  lastName,
  email,
  phone,
  price,
  checkinDate,
  checkinTime,
  checkoutTime
) => {
  try {
    const name = `${firstName} ${lastName}`;
    const totalAmount =
      calculateTimeDifference(checkinTime, checkoutTime) * price * 0.3;

    const userCreating = await createUser(name, email, phone);
    if (userCreating.status !== "OK") {
      alert("Không tạo được user " + userCreating.message);
      return;
    }
    const roomId = selectedSpaceId;
    const userId = userCreating.userId;
    const date = checkinDate;
    const timeStart = checkinTime;
    const timeEnd = checkoutTime;
    console.log(`room id: ${roomId}`);
    if (!roomId) {
      alert("roomid not found " + roomId);
    }
    const bookingCreating = await createBooking(
      userId,
      roomId,
      date,
      timeStart,
      timeEnd,
      totalAmount
    );

    alert(
      bookingCreating.status === "OK"
        ? "Đặt chỗ thành công!"
        : "Đặt chỗ thất bại!"
    );
    if (bookingCreating.status === "OK") {
      const data = {
        userName: userCreating.newUser.name,
        roomLocation: space.location,
        roomDescription: categories[selectedCategoryId].description,
      };
      localStorage.setItem(
        "bookingData",
        JSON.stringify(bookingCreating.newBooking)
      );
      localStorage.setItem("data", JSON.stringify(data));
      window.location.href = "confirm.html";
    }
  } catch (err) {
    alert(`Lỗi booking: ${err}`);
  }
};

getElement("category").addEventListener("change", async (event) => {
  selectedCategoryId = event.target.value;
  getElement("description_space").textContent =
    categories[selectedCategoryId]?.description || "No description available";
  await loadSpaces(selectedCategoryId);
});

document.addEventListener("DOMContentLoaded", loadCategories);

window.makeBooking = makeBooking;
