document.addEventListener("DOMContentLoaded", function () {
    fetch("../database/space.json")
        .then(response => response.json())
        .then(data => {
            const spaceSelect = document.getElementById("space");
            data.forEach(category => {
                category.spaces.forEach(space => {
                    let option = document.createElement("option");
                    option.value = JSON.stringify(space);
                    option.textContent = space.name;
                    spaceSelect.appendChild(option);
                });
            });
        })
        .catch(error => console.error("Error when dowload data:", error));

    document.getElementById("space").addEventListener("change", function () {
        let selectedSpace = this.value ? JSON.parse(this.value) : null;
        if (selectedSpace) {
            document.getElementById("img_space").src = selectedSpace.imageUrls[0];
            document.getElementById("price_space").textContent = selectedSpace.price_per_hour;
            document.getElementById("description_space").textContent = selectedSpace.location;
        }
    });
});