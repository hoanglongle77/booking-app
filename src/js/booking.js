import {
    getSpaces,
    getAllSeat,
    getSpaceById,
    getSeatBySpace,
    getSeatById,
  } from "../database/db_space.js";
  
  var spaceId = "0";
  
  const checkSpaceChange = async (selectedSpaceId) => {
    spaceId = selectedSpaceId; 
    if (spaceId) {
      const seatDiv = document.getElementById("seat");
      const seats = await getSeatBySpace(spaceId);
  
      if (seats.length > 0) {
        seatDiv.innerHTML = `<div class="mb-4">
            <label class="block mb-2" for="seatSelect">
              Seat
            </label>
            <select class="w-full bg-white p-2 border border-gray-300 rounded" id="seatSelect" required>
              <option value="">Chọn</option>
            </select>
          </div>`;
  
        const seatSelect = document.getElementById("seatSelect");
  
        seats.forEach((seat) => {
          let option = document.createElement("option");
          option.value = seat.id;
          option.textContent = `${seat.name} - ${seat.location}`;
          seatSelect.appendChild(option);
        });

        seatSelect.addEventListener("change", async (event) => {
          let selectedSeatId = event.target.value;
          checkSeatChange(spaceId, selectedSeatId);
        });
      } else {
        seatDiv.innerHTML = "<p>Không có ghế nào khả dụng.</p>";
      }
    }
  };

  const checkSeatChange = async (spaceId, seatId) => {
    if (seatId) {
      const seat = await getSeatById(spaceId, seatId);
      if (seat) {
        document.getElementById("img_space").src = seat.imageUrls?.[0] || "";
        document.getElementById("price_space").textContent =
          seat.price_per_hour || "N/A";
        document.getElementById("description_space").textContent =
          seat.location || "Unknown";
      }
    }
  };
  
  document.addEventListener("DOMContentLoaded", async () => {
    const spaceSelect = document.getElementById("space");
    const spaceType = await getSpaces();
  
    if (spaceType) {
      for (let id in spaceType) {
        let option = document.createElement("option");
        option.value = id;
        option.textContent = spaceType[id].type;
        spaceSelect.appendChild(option);
      }
    }
  });

  document.getElementById("space").addEventListener("change", async (event) => {
    checkSpaceChange(event.target.value);
  });
  