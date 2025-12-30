document.addEventListener('DOMContentLoaded', () => {
    console.log("Responsive script loaded");

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const navToggle = document.getElementById('nav-toggle');

    if (hamburger && navLinks && navActions) {
        hamburger.addEventListener('click', (e) => {
            // If using the checkbox hack, we can let it handle state,
            // OR we can manually toggle classes for extra robustness.
            // Let's do both to be safe.

            // Toggle active classes
            navLinks.classList.toggle('active');
            navActions.classList.toggle('active');

            // Find the checkbox and toggle it too if it's not the trigger
            if (navToggle && e.target !== navToggle) {
                // navToggle.checked = !navToggle.checked; 
                // Actually, the label click naturally toggles the checkbox.
                // We just need to sync the classes.
            }
        });

        // Also listen to checkbox changes directly in case the label is clicked
        if (navToggle) {
            navToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    navLinks.classList.add('active');
                    navActions.classList.add('active');
                } else {
                    navLinks.classList.remove('active');
                    navActions.classList.remove('active');
                }
            });
        }
    }
});
