import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWvvTlro7MdG5HMXVJCFtzSv1fAWECX2I",
  authDomain: "booking-space-94e9c.firebaseapp.com",
  databaseURL:
    "https://booking-space-94e9c-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "booking-space-94e9c",
  storageBucket: "booking-space-94e9c.firebasestorage.app",
  messagingSenderId: "118952243617",
  appId: "1:118952243617:web:ae386d5b660225b1bd9be0",
  measurementId: "G-CCMHDKSY85",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, app }; // Xuất cả app và db để dùng ở các file khác
