const footer = document.querySelector(".footer");
const date = new Date();
const menuButton = document.querySelector(".nav__menu-button");
const menu = document.querySelector(".nav__list");

footer.innerHTML += " " + date.getFullYear();

menuButton.addEventListener("click", function () {
  menu.classList.toggle("nav__list--hidden");
});
