// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, child, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCWvvTlro7MdG5HMXVJCFtzSv1fAWECX2I",
    authDomain: "booking-space-94e9c.firebaseapp.com",
    databaseURL: "https://booking-space-94e9c-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "booking-space-94e9c",
    storageBucket: "booking-space-94e9c.firebasestorage.app",
    messagingSenderId: "118952243617",
    appId: "1:118952243617:web:ae386d5b660225b1bd9be0",
    measurementId: "G-CCMHDKSY85"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Lưu danh sách booking vào bộ nhớ
let allBookings = [];
let selectedBookingId = null;

// Hàm cập nhật trạng thái booking trên Firebase
async function checkDone(bookingId) {
    try {
        // Thay đổi trạng thái từ "paid" thành "done"
        const bookingRef = ref(db, `bookings/${bookingId}`);
        await update(bookingRef, { status: "done" });

        // Cập nhật trạng thái ngay trên giao diện
        allBookings = allBookings.map(booking => 
            booking.id === bookingId ? { ...booking, status: "done" } : booking
        );
        displayBookings(allBookings);
    } catch (error) {
        console.error(`Lỗi khi cập nhật booking ${bookingId}:`, error);
    }
}

// Hàm hiển thị danh sách booking
function displayBookings(bookings) {
    const bookingTable = document.getElementById("booking_data_table");
    if (!bookingTable) return;

    bookingTable.innerHTML = ""; // Xóa dữ liệu cũ

    bookings.forEach(booking => {
        let statusClass = "bg-gray-300 text-gray-700"; // Mặc định
        if (booking.status === "paid") statusClass = "bg_paid text_paid";
        else if (booking.status === "pending") statusClass = "bg_pending text_pending";
        else if (booking.status === "done") statusClass = "bg_done text_done";

        // Nút xác nhận chỉ hiển thị khi status là "paid"
        const confirmButton = booking.status === "paid"
            ? `<td class="p-2">
                <button class="bg_done text_done p-2 pr-4 pl-4 rounded-sm check-done-btn" data-id="${booking.id}">✓</button>
                <button class="bg_pending text_done p-2 pr-4 pl-4 rounded-sm edit-btn" data-id="${booking.id}">Edit</button>
               </td>`
            : `<td class="p-2"></td>`;

        const row = `
            <tr class="border-b text-center text-gray-500">
                <td class="p-2">${booking.user.name}</td>
                <td class="p-2">${booking.user.email}<br>${booking.user.phone}</td>
                <td class="p-2">${booking.space.name}</td>
                <td class="p-2">${booking.totalAmount}</td>
                <td class="p-2">${booking.date}</td>
                <td class="p-2">${booking.timeStart} - ${booking.timeEnd}</td>
                <td class="p-2">
                    <span class="${statusClass} px-2 py-1 rounded-2xl min-w-[80px] inline-block">${booking.status}</span>
                </td>
                ${confirmButton}
            </tr>
        `;

        bookingTable.innerHTML += row;
    });

    // Gán sự kiện click cho nút "✓"
    document.querySelectorAll(".check-done-btn").forEach(button => {
        button.addEventListener("click", function () {
            const bookingId = this.getAttribute("data-id");
            checkDone(bookingId);
        });
    });
}

// Hàm lấy dữ liệu booking từ Firebase
async function fetchBookings() {
    const dbRef = ref(db);
    allBookings = []; // Xóa danh sách cũ trước khi tải lại

    try {
        const categoriesSnapshot = await get(child(dbRef, "categories"));
        if (!categoriesSnapshot.exists()) return;

        const categories = categoriesSnapshot.val();
        let allSpaces = {};
        for (const categoryId in categories) {
            const category = categories[categoryId];
            if (category.spaces) Object.assign(allSpaces, category.spaces);
        }

        const bookingsSnapshot = await get(child(dbRef, "bookings"));
        if (!bookingsSnapshot.exists()) return;

        const bookings = bookingsSnapshot.val();
        for (const bookingId in bookings) {
            const booking = bookings[bookingId];

            if (!booking.userId || !booking.roomId) continue;
            if (!allSpaces[booking.roomId]) continue;

            const userSnapshot = await get(child(dbRef, `users/${booking.userId}`));
            if (!userSnapshot.exists()) continue;

            const user = userSnapshot.val();
            const space = allSpaces[booking.roomId];

            allBookings.push({
                id: bookingId,
                ...booking,
                user,
                space
            });
        }

        displayBookings(allBookings);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu booking:", error);
    }
}

function openEditModal(bookingId) {
    selectedBookingId = bookingId;
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Gán giá trị ngày hiện tại vào input
    document.getElementById("editBookingDate").value = booking.date;

    // Hiển thị modal
    document.getElementById("editBookingModal").classList.remove("hidden");
}

// Đóng modal
function closeEditModal() {
    document.getElementById("editBookingModal").classList.add("hidden");
}

// Lưu ngày chỉnh sửa
async function saveEditBooking() {
    if (!selectedBookingId) return;
    const newDate = document.getElementById("editBookingDate").value;
    if (!newDate) return;

    try {
        // Cập nhật ngày trên Firebase
        const bookingRef = ref(db, `bookings/${selectedBookingId}`);
        await update(bookingRef, { date: newDate });

        // Cập nhật giao diện
        allBookings = allBookings.map(b =>
            b.id === selectedBookingId ? { ...b, date: newDate } : b
        );
        displayBookings(allBookings);

        // Đóng modal sau khi lưu
        closeEditModal();
    } catch (error) {
        console.error(`Lỗi khi cập nhật booking ${selectedBookingId}:`, error);
    }
}

// Gán sự kiện click cho nút "Edit"
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-btn")) {
        const bookingId = event.target.getAttribute("data-id");
        openEditModal(bookingId);
    }
});

// Gán sự kiện cho nút "Lưu" và "Hủy"
document.getElementById("saveEdit").addEventListener("click", saveEditBooking);
document.getElementById("cancelEdit").addEventListener("click", closeEditModal);

// Hàm lọc booking theo ngày
function filterByDate(selectedDate) {
    if (!selectedDate) {
        displayBookings(allBookings); // Hiển thị toàn bộ nếu không có ngày được chọn
        return;
    }

    const filteredBookings = allBookings.filter(booking => booking.date === selectedDate);
    displayBookings(filteredBookings);
}

// Gán sự kiện khi chọn ngày
document.getElementById("date-filter").addEventListener("change", function() {
    filterByDate(this.value);
});


function searchBookings(keyword) {
    const lowerKeyword = keyword.toLowerCase().trim();

    // Lọc danh sách booking theo keyword
    const filteredBookings = allBookings.filter(booking =>
        booking.user.name.toLowerCase().includes(lowerKeyword) ||   // Tìm theo tên
        booking.user.email.toLowerCase().includes(lowerKeyword) ||  // Tìm theo email
        booking.user.phone.toLowerCase().includes(lowerKeyword) ||  // Tìm theo số điện thoại
        booking.space.name.toLowerCase().includes(lowerKeyword)     // Tìm theo tên không gian
    );

    // Hiển thị danh sách lọc được
    displayBookings(filteredBookings);
}

document.getElementById("search-input").addEventListener("keyup", function() {
    searchBookings(this.value);
});

// Gọi hàm khi trang tải
window.onload = fetchBookings;
