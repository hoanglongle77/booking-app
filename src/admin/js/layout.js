function loadComponent(file, elementId, callback) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = data;
        if (callback) callback(); // Execute callback after loading
      } else {
        console.error(`Element with ID "${elementId}" not found.`);
      }
    })
    .catch((error) => console.error(`Error loading ${file}:`, error));
}

document.addEventListener("DOMContentLoaded", function () {
  loadComponent("../components/sidebar.html", "adminSidebar", function () {
    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");

    if (menuButton && sidebar) {
      menuButton.addEventListener("click", function () {
        sidebar.classList.toggle("active");
      });
    } else {
      console.error("Menu button or sidebar not found after loading.");
    }
  });

  // If menuButton exists in another file, handle it separately
  const menuButton = document.getElementById("menuButton");
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      console.log("Menu button clicked!");
    });
  }
});
