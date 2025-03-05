import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase initialized successfully!");
} catch (error) {
    console.error("Firebase initialization failed:", error);
}
if (db) {
    const testRef = ref(db, 'test/connection');

    set(testRef, { connected: true })
        .then(() => {
            console.log("Database write successful!");
            return get(testRef);
        })
        .then((snapshot) => {
            if (snapshot.exists()) {
                console.log("Database read successful:", snapshot.val());
            } else {
                console.error("Database read failed: Data does not exist.");
            }
        })
        .catch((error) => {
            console.error("Database operation failed:", error);
        });
}

export { db, ref, set, get, update };