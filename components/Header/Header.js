// Revisa si estamos en inicio
const isHome =
  window.location.pathname.endsWith("index.html") ||
  window.location.pathname === "/";

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const homeLink = document.getElementById("homeLink");

// Ocultar HOME si estamos en index
if (isHome) {
  homeLink.style.display = "none";
} else {
  homeLink.style.display = "";
}

// Toggle del menú hamburguesa
menuBtn.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});
