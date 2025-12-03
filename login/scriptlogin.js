// =======================================================
// LOGIN - MANEJO DE SESIÓN + VALIDACIÓN EMPRESA
// =======================================================
document.addEventListener("DOMContentLoaded", () => {

  // Limpiar datos previos de sesión (importante)
  localStorage.removeItem("userToken");
  localStorage.removeItem("rol_usuario");

  const loginForm    = document.getElementById("loginForm");
  const emailInput   = document.getElementById("email");
  const passwordInput= document.getElementById("password");
  const msg          = document.getElementById("msg");
  const btnRegister  = document.getElementById("btnRegister");
  const forgotLink   = document.querySelector(".text-wrapper-4");

  const API_BASE        = "http://52.200.165.176:7070/api";
  const LOGIN_API_URL   = `${API_BASE}/login`;
  const PERFIL_VEND_URL = `${API_BASE}/vendedor/perfil`;

  // =======================================================
  // BOTÓN: Registrarme
  // =======================================================
  btnRegister.addEventListener("click", () => {
    window.location.href = "../registro/registro.html";
  });

  // =======================================================
  // BOTÓN: Olvidaste tu contraseña
  // =======================================================
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../recuperar/recuperar.html";
    });
  }

  // =======================================================
  // FUNCIÓN AUXILIAR: obtener estado_aprobacion de la empresa
  // =======================================================
  async function obtenerEstadoEmpresa(token) {
    try {
      const res = await fetch(PERFIL_VEND_URL, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("=== RAW PERFIL VENDEDOR RESPONSE ===");
      console.log("Status:", res.status);

      if (!res.ok) {
        console.warn("No se pudo obtener perfil de vendedor");
        return null;
      }

      const data = await res.json();
      console.log("Perfil vendedor:", data);

      return (data.estado_aprobacion || "").toLowerCase(); // pendiente, aprobada, rechazada, suspendida
    } catch (err) {
      console.error("Error al obtener perfil de vendedor:", err);
      return null;
    }
  }

  // =======================================================
  // PETICIÓN LOGIN
  // =======================================================
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.style.color = "inherit";

    const correo      = emailInput.value.trim();
    const contraseña  = passwordInput.value.trim();

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

      console.log("=== RAW LOGIN RESPONSE ===");
      console.log("Status:", response.status);

      const data = await response.json();
      console.log("JSON recibido:", data);

      // Si el backend manda error claro:
      if (!response.ok || !data.token) {
        msg.textContent = data.error || "Correo o contraseña incorrectos.";
        msg.style.color = "red";
        return;
      }

      // Normalizar rol
      const rolNormalizado = String(data.rol || "")
        .trim()
        .toLowerCase();

      // Guardar token y rol (por si se aprueba correctamente)
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("rol_usuario", rolNormalizado);

      let redirectUrl = null;

      // ===================================================
      // LÓGICA ESPECIAL PARA EMPRESA
      // ===================================================
      if (rolNormalizado === "empresa") {
        const estado = await obtenerEstadoEmpresa(data.token);
        console.log("Estado empresa:", estado);

        if (!estado) {
          // Por seguridad, mejor no dejamos pasar si no se puede validar
          msg.textContent = "No se pudo validar el estado de tu cuenta. Intenta más tarde.";
          msg.style.color = "red";
          localStorage.clear();
          return;
        }

        if (estado === "pendiente") {
          msg.textContent = "Tu cuenta de vendedor está en revisión. Un administrador aprobará o rechazará tu solicitud.";
          msg.style.color = "red";
          localStorage.clear();
          return;
        }

        if (estado === "rechazada") {
          msg.textContent = "Tu solicitud como vendedor fue rechazada. No puedes acceder al panel de vendedor.";
          msg.style.color = "red";
          localStorage.clear();
          return;
        }

        if (estado === "suspendida") {
          msg.textContent = "Tu cuenta de vendedor está suspendida. Contacta al administrador para más información.";
          msg.style.color = "red";
          localStorage.clear();
          return;
        }

        // Solo si está aprobada dejamos que entre al home de vendedor
        if (estado === "aprobada") {
          redirectUrl = "../homemisproductos/homemisproductos.html";
        } else {
          // Cualquier valor raro lo tratamos como bloqueado
          msg.textContent = "Estado de cuenta no válido. No puedes iniciar sesión como vendedor.";
          msg.style.color = "red";
          localStorage.clear();
          return;
        }

      } else if (rolNormalizado === "cliente") {
        redirectUrl = "../homecliente/homecliente.html";

      } else if (rolNormalizado === "admin") {
        redirectUrl = "../homeadmin/homeadmin.html";

      } else {
        // Rol desconocido → lo mandamos al público
        redirectUrl = "../homepublico/homepublico.html";
      }

      // Si llegamos aquí es porque SÍ se permite el acceso
      msg.textContent = "Inicio de sesión exitoso.";
      msg.style.color = "green";

      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1200);
      }

    } catch (error) {
      console.error("Error de red:", error);
      msg.textContent = "Error de conexión con el servidor.";
      msg.style.color = "red";
    }
  });
});
