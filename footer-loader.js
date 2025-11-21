// Auto-load footer
fetch("/footer.html")
  .then(response => response.text())
  .then(data => {
    document.body.insertAdjacentHTML("beforeend", data);
    setActiveFooterLink();
  });

// Auto-detect active link
function setActiveFooterLink() {
  const path = window.location.pathname.split("/").pop().replace(".html", "");

  document.querySelectorAll(".footer-nav .nav-item").forEach(item => {
    if (item.dataset.page === path || (path === "" && item.dataset.page === "index")) {
      item.classList.add("active");
    }
  });
}
