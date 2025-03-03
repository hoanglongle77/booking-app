const checkinDate = document.getElementById("checkin-date");
const checkinTime = document.getElementById("checkin-time");
const checkoutTime = document.getElementById("checkout-time");
const errorMessage = document.getElementById("error-message");

function showError(inputElement, message) {
    errorMessage.textContent = message;
    inputElement.classList.add("shake", "border-red-500");
    setTimeout(() => {
        inputElement.classList.remove("shake");
    }, 300);
}

function clearError(inputElement) {
    errorMessage.textContent = "";
    inputElement.classList.remove("border-red-500");
}

function validateTime() {
    if (!checkinTime.value || !checkoutTime.value) return;

    const [checkinHour, checkinMinute] = checkinTime.value.split(":").map(Number);
    const [checkoutHour, checkoutMinute] = checkoutTime.value.split(":").map(Number);

    const checkinTotalMinutes = checkinHour * 60 + checkinMinute;
    const checkoutTotalMinutes = checkoutHour * 60 + checkoutMinute;

    if (checkoutTotalMinutes <= checkinTotalMinutes) {
        checkoutTime.value = "";
        showError(checkoutTime, "Checkout time must be later than checkin time!");
    } else {
        clearError(checkoutTime);
    }
}

function validateDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(checkinDate.value);

    if (selectedDate <= today) {
        checkinDate.value = "";
        showError(checkinDate, "Check-in date must be in the future!");
    } else {
        clearError(checkinDate);
    }
}

checkinDate.addEventListener("change", validateDate);
checkinTime.addEventListener("change", validateTime);
checkoutTime.addEventListener("change", validateTime);
