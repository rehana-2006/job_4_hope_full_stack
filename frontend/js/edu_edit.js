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
    try {
        const data = await getMyProfile();
        if (!data || !data.profile) {
            alert("Could not load profile data.");
            return;
        }

        const p = data.profile;
        const user = data;


        setValue('orgName', p.org_name);
        setValue('orgType', p.org_type);
        setValue('description', p.description);
        setValue('capacity', p.capacity);
        setValue('ageRange', p.age_range);
        setValue('contactName', p.contact_name);
        setValue('jobTitle', p.job_title);
        setValue('email', user.email);
        setValue('phone', p.phone);
        setValue('website', p.website);
        setValue('address', p.address);
        setValue('city', p.city);
        setValue('state', p.state);


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
    const contactName = document.getElementById('contactName').value;

    if (!validateName(contactName)) {
        alert("Please enter a valid contact name (only letters and spaces, at least 2 characters).");
        return;
    }

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
        city: formData.get('city'),
        state: formData.get('state'),
        specialization: Array.from(document.querySelectorAll('input[name="specialization"]:checked')).map(cb => cb.value)
    };

    try {
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

function validateName(name) {
    const re = /^[A-Za-z\s]{2,50}$/;
    return re.test(name.trim());
}
