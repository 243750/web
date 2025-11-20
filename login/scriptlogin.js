// =======================================================
// 🔹 LOGIN - MANEJO DE SESIÓN (CORREGIDO)
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  
  // Limpiar datos previos de sesión (importante)
  localStorage.removeItem("userToken");
  localStorage.removeItem("rol_usuario");

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const msg = document.getElementById("msg");
  const btnRegister = document.getElementById("btnRegister");
  const forgotLink = document.querySelector(".text-wrapper-4");

  // ⭐ Backend real
  const LOGIN_API_URL = "http://52.200.165.176:7070/api/login";

  // =======================================================
  // 🔹 BOTÓN: Registrarme
  // =======================================================
  btnRegister.addEventListener("click", () => {
    window.location.href = "../registro/registro.html";
  });

  // =======================================================
  // 🔹 BOTÓN: Olvidaste tu contraseña
  // =======================================================
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../recuperar/recuperar.html";
    });
  }

  // =======================================================
  // 🔹 PETICIÓN LOGIN
  // =======================================================
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const correo = emailInput.value.trim();
    const contraseña = passwordInput.value.trim();

    if (!correo || !contraseña) {
      msg.textContent = "Por favor, completa todos los campos.";
      msg.style.color = "red";
      return;
    }

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();
      console.log("Respuesta login:", data);

      if (response.ok && data.token) {

        // Normalizar rol
        const rolNormalizado = String(data.rol || "")
          .trim()
          .toLowerCase();

        // Guardar sesión
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("rol_usuario", rolNormalizado);

        msg.textContent = "Inicio de sesión exitoso.";
        msg.style.color = "green";

        // Redirección según rol
        setTimeout(() => {
          switch (rolNormalizado) {
            case "cliente":
              window.location.href = "../homecliente/homecliente.html";
              break;

            case "empresa":
              window.location.href = "../homemisproductos/homemisproductos.html";
              break;

            case "admin":
              window.location.href = "../homeadmin/homeadmin.html";
              break;

            default:
              window.location.href = "../homepublico/homepublico.html";
          }
        }, 1200);

      } else {
        msg.textContent = data.error || "Correo o contraseña incorrectos.";
        msg.style.color = "red";
      }

    } catch (error) {
      console.error("Error de red:", error);
      msg.textContent = "Error de conexión con el servidor.";
      msg.style.color = "red";
    }
  });
});
