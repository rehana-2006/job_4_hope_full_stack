const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = document.getElementById("loginBtn");

        try {
            submitBtn.textContent = "Signing In...";
            submitBtn.disabled = true;

            const data = await loginUser(email, password);

            
            const payload = JSON.parse(atob(data.access_token.split('.')[1]));

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', payload.role);
            localStorage.setItem('email', payload.sub);

            switch (payload.role) {
                case 'parent':
                    window.location.href = './parent_dash.html';
                    break;
                case 'educator':
                    window.location.href = './edu_dash.html';
                    break;
                case 'recruiter':
                    window.location.href = './rec_dash.html';
                    break;
                case 'admin':
                    window.location.href = './admin.html';
                    break;
                default:
                    window.location.href = '../index.html';
            }
        } catch (error) {
            alert(error.message);
            submitBtn.textContent = "Sign In";
            submitBtn.disabled = false;
        }
    });
}
