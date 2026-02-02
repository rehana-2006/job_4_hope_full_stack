document.addEventListener('DOMContentLoaded', () => {
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
});
