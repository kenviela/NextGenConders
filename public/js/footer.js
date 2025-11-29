// llamar al footer
fetch("./components/Footer/Footer.html")
  .then((res) => res.text())
  .then((html) => {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
  });
