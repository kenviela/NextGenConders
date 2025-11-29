// Cargar el header a la vista
fetch("./components/Header/Header.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("header").innerHTML = data;
  });
