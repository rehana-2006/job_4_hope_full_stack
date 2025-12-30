document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Get form data
    const formData = {
        full_name: form.querySelector('[name="full_name"]').value,
        email: form.querySelector('[name="email"]').value,
        category: form.querySelector('[name="category"]').value,
        subject: form.querySelector('[name="subject"]').value,
        message: form.querySelector('[name="message"]').value
    };

    // Disable button and show loading
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:8000/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Success!
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
