// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'educator') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    document.getElementById('educationalProfileEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
});

async function loadProfileData() {
    // Assuming we have a getMyProfile function in api.js 
    // We might need to ensure api.js is included in the html
    if (typeof getMyProfile !== 'function') {
        console.error("api.js not loaded");
        return;
    }

    try {
        const data = await getMyProfile();
        if (!data || !data.profile) {
            alert("Could not load profile data.");
            return;
        }

        const p = data.profile;
        const user = data; // email wraps the profile

        // Populate fields
        setValue('orgName', p.org_name);
        setValue('orgType', p.org_type);
        setValue('description', p.description);
        setValue('capacity', p.capacity);
        setValue('ageRange', p.age_range);
        setValue('contactName', p.contact_name);
        setValue('jobTitle', p.job_title);
        setValue('email', user.email); // Read-only usually? Or pre-fill
        setValue('phone', p.phone);
        setValue('website', p.website);
        setValue('address', p.address); // Note: schema might have address or location. Check schema.
        setValue('city', p.city);
        setValue('state', p.state);

        // Checkboxes for specializations
        if (p.specialization && Array.isArray(p.specialization)) {
            const checkboxes = document.querySelectorAll('input[name="specialization"]');
            checkboxes.forEach(cb => {
                if (p.specialization.includes(cb.value)) {
                    cb.checked = true;
                }
            });
        }

    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Failed to load current profile data.");
    }
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.value = value || '';
    }
}

async function updateProfile() {
    const btn = document.querySelector('.btn-update');
    const originalText = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    // Gather data
    const formData = new FormData(document.getElementById('educationalProfileEditForm'));
    const profileData = {
        org_name: formData.get('orgName'),
        org_type: formData.get('orgType'),
        description: formData.get('description'),
        capacity: parseInt(formData.get('capacity')),
        age_range: formData.get('ageRange'),
        contact_name: formData.get('contactName'),
        job_title: formData.get('jobTitle'),
        phone: formData.get('phone'),
        website: formData.get('website'),
        // Address might need concatenation or separate fields depending on schema
        // For now, let's assume we update location string or separate fields if backend supports it.
        // Looking at schema: city, state, location. 
        city: formData.get('city'),
        state: formData.get('state'),
        specialization: Array.from(document.querySelectorAll('input[name="specialization"]:checked')).map(cb => cb.value)
    };

    // Note: The backend schema for EducatorProfileUpdate needs to be checked.
    // If it expects 'location', we might combine city/state or use address.

    try {
        // We need an updateProfile endpoint in api.js or call fetch directly
        // Assuming updateEducatorProfile exists or we make a generic Put
        // For now, let's use a hypothetical updateMyProfile(profileData) wrapper

        // Since we don't have updateMyProfile in api.js yet, let's implement the fetch here or add to api.js
        // Ideally add to api.js, but for speed, I'll allow this file to handle logic if api.js is missing it.
        // BUT api.js is better for consistency.

        // Let's check api.js for update function.
        // PROCEEDING to write this file first, then check/update api.js

        await updateEducatorProfile(profileData);

        alert("Profile updated successfully!");
        window.location.href = './edu_dash.html';
    } catch (error) {
        console.error(error);
        alert("Error updating profile: " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
