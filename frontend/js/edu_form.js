document.getElementById('educationalRegistrationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    const specializations = [];
    document.querySelectorAll('input[name="specialization"]:checked').forEach(cb => {
        specializations.push(cb.value);
    });

    const payload = {
        org_name: document.getElementById('orgName').value,
        org_type: document.getElementById('orgType').value,
        description: document.getElementById('description').value,
        capacity: parseInt(document.getElementById('capacity').value),
        age_range: document.getElementById('ageRange').value,
        specialization: specializations,
        contact_name: document.getElementById('contactName').value,
        job_title: document.getElementById('jobTitle').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value,
        website: document.getElementById('website').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pincode: document.getElementById('pincode').value,
        country: document.getElementById('country').value
    };

    try {
        await registerEducator(payload);
        document.getElementById('educationalRegistrationForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        window.scrollTo(0, 0);
    } catch (error) {
        alert(error.message);
        submitBtn.textContent = 'Register Organisation';
        submitBtn.disabled = false;
    }
});
