// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'recruiter') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    document.getElementById('recruiterProfileEditForm').addEventListener('submit', async (e) => {
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
        setValue('contactName', p.contact_name);
        setValue('jobTitle', p.job_title);
        setValue('phone', p.phone);
        setValue('email', user.email);
        setValue('website', p.website);
        setValue('address', p.address);
        setValue('city', p.city);
        setValue('state', p.state);
        setValue('pincode', p.pincode);
        setValue('country', p.country);

    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Failed to load profile details.");
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

    const formData = new FormData(document.getElementById('recruiterProfileEditForm'));
    const profileData = {
        org_name: formData.get('orgName'),
        org_type: formData.get('orgType'),
        description: formData.get('description'),
        contact_name: formData.get('contactName'),
        job_title: formData.get('jobTitle'),
        phone: formData.get('phone'),
        website: formData.get('website'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        country: formData.get('country')
    };

    try {
        await updateRecruiterProfile(profileData);
        alert("Profile updated successfully!");
        window.location.href = './rec_dash.html';
    } catch (error) {
        console.error(error);
        alert("Update failed: " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
