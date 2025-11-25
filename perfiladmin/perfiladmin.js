/* ================= NAVBAR DROPDOWN ================= */
document.querySelector(".perfil-area").addEventListener("click", function (e) {
  e.stopPropagation();
  this.classList.toggle("show");
});

window.addEventListener("click", () => {
  document.querySelector(".perfil-area").classList.remove("show");
});

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../login/login.html";
});

/* ================= REDIRECCIÓN A ESTADÍSTICAS ================= */
function irEstadisticas() {
  window.location.href = "../estadisticasadmin/estadisticasadmin.html";
}
