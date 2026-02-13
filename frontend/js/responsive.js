document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const navToggle = document.getElementById('nav-toggle');

    if (hamburger && navLinks && navActions) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navActions.classList.toggle('active');
        });

        if (navToggle) {
            navToggle.addEventListener('change', (e) => {
                const isActive = e.target.checked;
                navLinks.classList.toggle('active', isActive);
                navActions.classList.toggle('active', isActive);
            });
        }
    }

    // Login/Logout Toggle Logic
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && navActions) {
        const isIndexPage = !window.location.pathname.includes('/pages/');
        const loginUrl = isIndexPage ? './pages/sign_in.html' : './sign_in.html';
        const homeUrl = isIndexPage ? './index.html' : '../index.html';

        navActions.innerHTML = `
            <a href="#" class="btn btn-login" id="logoutBtn" style="background-color: #dc3545; border-color: #dc3545;">Logout</a>
        `;

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user_id');
            window.location.href = homeUrl;
        });
    }
});
