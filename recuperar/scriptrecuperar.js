document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recoverForm");
  const msg = document.getElementById("msg");
  const volverBtn = document.getElementById("btnVolver");

  // Redirección a login
  volverBtn.addEventListener("click", () => {
    window.location.href = "../login/login.html";
  });

  // Simulación de envío de correo
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    if (!email) {
      msg.textContent = "Por favor, ingresa tu correo electrónico.";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Enviando enlace de recuperación...";
    msg.style.color = "#6B1FAD";

    setTimeout(() => {
      msg.textContent = "Se ha enviado un enlace de recuperación a tu correo.";
      msg.style.color = "green";
    }, 1500);
  });
});
