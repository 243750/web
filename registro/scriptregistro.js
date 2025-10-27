document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
const userType = document.getElementById('tipo-usuario');
  const username = document.getElementById('username');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const msg = document.getElementById('msg');
  const passwordError = document.getElementById('passwordError');

  // ✅ URL del backend de Vélez
  const REGISTER_API_URL = 'http://54.163.133.21:7070/api/register';

  // 🔹 Validación en tiempo real
  confirmPassword.addEventListener('input', () => {
    if (confirmPassword.value && confirmPassword.value !== password.value) {
      confirmPassword.classList.add('input-error');
      passwordError.textContent = 'Las contraseñas no coinciden';
    } else {
      confirmPassword.classList.remove('input-error');
      passwordError.textContent = '';
    }
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    msg.textContent = '';
    passwordError.textContent = '';

    [userType, username, email, password, confirmPassword].forEach(el => el.classList.remove('input-error'));

    // Validación de campos vacíos
    if (!userType.value || !username.value || !email.value || !password.value || !confirmPassword.value) {
      showMessage('Por favor, completa todos los campos.', 'error');
      highlightEmptyFields();
      return;
    }

    // Validar contraseñas iguales
    if (password.value !== confirmPassword.value) {
      showMessage('Las contraseñas no coinciden.', 'error');
      confirmPassword.classList.add('input-error', 'shake');
      passwordError.textContent = 'Las contraseñas no coinciden';
      setTimeout(() => confirmPassword.classList.remove('shake'), 400);
      return;
    }

    const registerData = {
      tipoUsuario: userType.value,   // comprador / vendedor
      nombre: username.value,
      email: email.value,
      password: password.value
    };

    try {
      const response = await fetch(REGISTER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('¡Registro exitoso! Redirigiendo...', 'success');
        setTimeout(() => window.location.href = '../login/index.html', 1500);
      } else {
        showMessage(data.error || 'Error en el registro. Intenta nuevamente.', 'error');
      }
    } catch (error) {
      console.error('Error de red:', error);
      showMessage('Error de conexión con el servidor.', 'error');
    }
  });

  function showMessage(text, type) {
    msg.textContent = text;
    msg.style.color = type === 'error' ? 'red' : 'green';
    msg.style.fontWeight = 'bold';
    msg.style.textAlign = 'center';
    msg.style.transition = 'all 0.3s ease';
  }

  function highlightEmptyFields() {
    [userType, username, email, password, confirmPassword].forEach(el => {
      if (!el.value) {
        el.classList.add('input-error', 'shake');
        setTimeout(() => el.classList.remove('shake'), 400);
      }
    });
  }
});
