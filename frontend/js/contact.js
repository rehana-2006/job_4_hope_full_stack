document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    const formData = {
        full_name: form.querySelector('[name="full_name"]').value,
        email: form.querySelector('[name="email"]').value,
        category: form.querySelector('[name="category"]').value,
        subject: form.querySelector('[name="subject"]').value,
        message: form.querySelector('[name="message"]').value
    };

    if (!validateName(formData.full_name)) {
        alert("Please enter a valid full name (only letters and spaces, at least 2 characters).");
        return;
    }

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        await submitContact(formData);

        alert('✅ Message sent successfully! We will get back to you within 24 hours.');
        form.reset();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to send message. Please try again or contact us directly at contact@job4hope.org');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

function validateName(name) {
    const re = /^[A-Za-z\s]{2,50}$/;
    return re.test(name.trim());
}
