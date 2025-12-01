(async function loadHeader() {
  const headerContainer = document.getElementById("header");
  console.log("¿Existe #header?", headerContainer);

  try {
    const res = await fetch("../../components/Header/Header.html");
    console.log("Respuesta fetch:", res.status);
    const html = await res.text();
    headerContainer.innerHTML = html;

    const menuBtn = document.getElementById("menuBtn");
    const navMenu = document.getElementById("navMenu");

    console.log("menuBtn encontrado:", menuBtn);
    console.log("navMenu encontrado:", navMenu);

    if (menuBtn && navMenu) {
      menuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("hidden");
        console.log("click detectado");
      });
    }
  } catch (err) {
    console.error("ERROR:", err);
  }
})();
