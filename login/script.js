// Espera a que el documento esté listo
document.addEventListener('DOMContentLoaded', () => {

    // Referencias al formulario y campos
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const msg = document.getElementById('msg');

    // ✅ URL real del backend de Vélez en AWS
    const LOGIN_API_URL = 'http://54.163.133.21:7070/api/login';

    // Función para manejar el login
    async function handleLogin(event) {
        event.preventDefault();
        msg.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            msg.textContent = 'Por favor, completa todos los campos.';
            msg.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                msg.textContent = `¡Bienvenido, ${data.usuario?.nombre || 'Usuario'}!`;
                msg.style.color = 'green';
                console.log('Inicio de sesión exitoso:', data);

                // Guardar token (si lo envía el backend)
                if (data.token) {
                    localStorage.setItem('userToken', data.token);
                }

                // Redirigir (ejemplo)
                setTimeout(() => {
                    window.location.href = 'catalogo.html';
                }, 1000);

            } else {
                msg.textContent = data.error || 'Correo o contraseña incorrectos.';
                msg.style.color = 'red';
            }

        } catch (error) {
            console.error('Error de red:', error);
            msg.textContent = 'Error de conexión. Revisa si el servidor está encendido.';
            msg.style.color = 'red';
        }
    }

    // Escucha el envío del formulario
    loginForm.addEventListener('submit', handleLogin);
});
