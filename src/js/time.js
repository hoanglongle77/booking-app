
    const checkinDate = document.getElementById("checkin-date");
    const checkinTime = document.getElementById("checkin-time");
    const checkoutTime = document.getElementById("checkout-time");
    const errorMessage = document.getElementById("error-message");

    function validateTime() {
        if (!checkinTime.value || !checkoutTime.value) return;

        const [checkinHour, checkinMinute] = checkinTime.value.split(":").map(Number);
        const [checkoutHour, checkoutMinute] = checkoutTime.value.split(":").map(Number);

        const checkinTotalMinutes = checkinHour * 60 + checkinMinute;
        const checkoutTotalMinutes = checkoutHour * 60 + checkoutMinute;

        if (checkoutTotalMinutes <= checkinTotalMinutes) {
            errorMessage.textContent = "Time checkout need to large than time checkin";
            checkoutTime.value = "";
        } else {
            errorMessage.textContent = "";
        }
    }

    function validateDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(checkinDate.value);

        if (selectedDate <= today) {
            errorMessage.textContent = "Checkin date error";
            checkinDate.value = "";
        } else {
            errorMessage.textContent = "";
        }
    }

    checkinDate.addEventListener("change", validateDate);
    checkinTime.addEventListener("change", validateTime);
    checkoutTime.addEventListener("change", validateTime);