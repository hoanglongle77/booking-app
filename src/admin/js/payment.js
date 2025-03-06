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

let allPayments = [];

async function fetchPayments() {
    const dbRef = ref(db);
    allPayments = [];

    try {
        const paymentsSnapshot = await get(child(dbRef, "payments"));
        if (!paymentsSnapshot.exists()) return;

        const payments = paymentsSnapshot.val();
        for (const paymentId in payments) {
            const payment = payments[paymentId];
            
            // Lấy bookingId từ payment
            const bookingSnapshot = await get(child(dbRef, `bookings/${payment.bookingId}`));
            if (!bookingSnapshot.exists()) continue;
            const booking = bookingSnapshot.val();

            // Lấy userId từ booking
            const userSnapshot = await get(child(dbRef, `users/${booking.userId}`));
            if (!userSnapshot.exists()) continue;
            const user = userSnapshot.val();

            allPayments.push({
                id: paymentId,
                ...payment,
                userName: user.name // Lưu tên user
            });
        }

        displayPayments(allPayments);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu payments:", error);
    }
}

function displayPayments(payments) {
    const paymentTable = document.getElementById("payment_data_table");
    if (!paymentTable) return;

    paymentTable.innerHTML = "";

    payments.forEach(payment => {
        let statusClass = "bg-gray-300 text-gray-700";
        if (payment.status === "paid") statusClass = "bg_paid text_paid";
        else if (payment.status === "pending") statusClass = "bg_pending text_pending";
        else if (payment.status === "done") statusClass = "bg_done text_done";

        const row = `
            <tr class="border-b text-center text-gray-500">
                <td class="p-2">${payment.userName}</td>
                <td class="p-2">${payment.date || "N/A"}</td>
                <td class="p-2">${payment.amount}</td>
                <td class="p-2">${payment.cardNumber}</td>
                <td class="p-2">
                    <span class="${statusClass} px-2 py-1 rounded-2xl min-w-[80px] inline-block">${payment.status}</span>
                </td>
            </tr>
        `;

        paymentTable.innerHTML += row;
    });
}

function filterByDate(selectedDate) {
    if (!selectedDate) {
        displayPayments(allPayments);
        return;
    }

    const filteredPayments = allPayments.filter(payment => 
        payment.date && payment.date.startsWith(selectedDate) // Kiểm tra payment.date có tồn tại
    );

    displayPayments(filteredPayments);
}

document.getElementById("date-filter").addEventListener("change", function() {
    filterByDate(this.value);
});

function searchPayments(keyword) {
    const lowerKeyword = keyword.toLowerCase().trim();

    const filteredPayments = allPayments.filter(payment =>
        (payment.userName && payment.userName.toLowerCase().includes(lowerKeyword)) ||
        (payment.cardNumber && payment.cardNumber.toLowerCase().includes(lowerKeyword))
    );

    displayPayments(filteredPayments);
}


document.getElementById("search-input").addEventListener("input", function() {
    searchPayments(this.value);
});

window.onload = fetchPayments;