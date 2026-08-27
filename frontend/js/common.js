// ==========================
// Sidebar
// ==========================

const menuButton = document.querySelector(".menu-button");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (menuButton && sidebar && overlay) {

    menuButton.addEventListener("click", () => {

        sidebar.classList.add("active");
        overlay.classList.add("active");

    });

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

    });

}

const settingsButton = document.querySelector(".profile-button");
if (settingsButton) {

    settingsButton.addEventListener("click", () => {
        window.location.href = "/settings";
    });

}