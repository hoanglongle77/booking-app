document.addEventListener("DOMContentLoaded", function () {
  function loadComponent(elementId, filePath) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        document.getElementById(elementId).innerHTML = xhr.responseText;
      }
    };
    xhr.send();
  }

  loadComponent("header-placeholder", "../components/header.html");
  loadComponent("footer-placeholder", "../components/footer.html");
});
