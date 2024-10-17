
// document.addEventListener('DOMContentLoaded', () => {
//     const registerForm = document.getElementById('registerForm');
//     const loginForm = document.getElementById('loginForm');

//     if (registerForm) {
//         registerForm.addEventListener('submit', async (event) => {
//             event.preventDefault();
//             const name = registerForm.name.value;
//             const email = registerForm.email.value;
//             const password = registerForm.password.value;

//             const response = await fetch('/api/users/register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ name, email, password })
//             });
//             const data = await response.json();
//             alert(data.message);
//             registerForm.reset();
//         });
//     }

//     if (loginForm) {
//         loginForm.addEventListener('submit', async (event) => {
//             event.preventDefault();
//             const email = loginForm.email.value;
//             const password = loginForm.password.value;

//             const response = await fetch('/api/users/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password })
//             });
//             const data = await response.json();
//             if (data.token) {
//                 localStorage.setItem('token', data.token);
//                 alert('Login successful!');
//                 window.location.href = 'dashboard.html';
//             } else {
//                 alert(data.message);
//             }
//         });
//     }
// });



document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = registerForm.name.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                // On successful registration, navigate to login.html
                window.location.href = '/login.html';
            }

            registerForm.reset();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.token) {
                localStorage.setItem('token', data.token);
                alert('Login successful!');
                // On successful login, navigate to dashboard.html
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message);
            }
        });
    }
});
