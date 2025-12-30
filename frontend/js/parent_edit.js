// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'parent') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
});

async function loadProfileData() {
    try {
        const data = await getMyProfile();
        if (!data || !data.profile) {
            alert("Could not load profile data.");
            return;
        }

        const p = data.profile;

        // Populate Personal Details
        document.getElementById('fullName').value = p.full_name || '';
        document.getElementById('phone').value = p.phone || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('email').disabled = true; // Email is not editable here
        document.getElementById('location').value = p.location || '';
        document.getElementById('experience').value = p.experience || '';

        // Populate Skills
        const skillsObj = {};
        if (p.skills && Array.isArray(p.skills)) {
            p.skills.forEach(s => skillsObj[s.toLowerCase()] = true);
        }

        document.querySelectorAll('input[name="skills"]').forEach(checkbox => {
            if (skillsObj[checkbox.value.toLowerCase()]) {
                checkbox.checked = true;
            }
        });

        // Populate Children (Handle up to 2 for now based on static form)
        // Ideally this should be dynamic, but matching the static HTML for now.
        if (p.children && p.children.length > 0) {
            const c1 = p.children[0];
            document.getElementById('child1Name').value = c1.name || '';
            document.getElementById('child1Age').value = c1.age || '';
            document.getElementById('child1Grade').value = c1.grade || '';
            document.getElementById('child1Status').value = c1.school_status || '';
            document.getElementById('child1Interests').value = c1.interests || '';

            if (p.children.length > 1) {
                const c2 = p.children[1];
                document.getElementById('child2Name').value = c2.name || '';
                document.getElementById('child2Age').value = c2.age || '';
                document.getElementById('child2Grade').value = c2.grade || '';
                document.getElementById('child2Status').value = c2.school_status || '';
                document.getElementById('child2Interests').value = c2.interests || '';
            }
        }

    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Failed to load profile details.");
    }
}

document.getElementById('parentProfileEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.querySelector('.btn-update');
    const originalText = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
        // Collect Data
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const location = document.getElementById('location').value;
        const experience = document.getElementById('experience').value;

        // Skills
        const skills = [];
        document.querySelectorAll('input[name="skills"]:checked').forEach(cb => {
            skills.push(cb.value);
        });

        // Children
        const children = [];

        // Child 1
        const c1Name = document.getElementById('child1Name').value;
        if (c1Name) {
            children.push({
                name: c1Name,
                age: parseInt(document.getElementById('child1Age').value) || 0,
                grade: document.getElementById('child1Grade').value,
                school_status: document.getElementById('child1Status').value,
                interests: document.getElementById('child1Interests').value
            });
        }

        // Child 2
        const c2Name = document.getElementById('child2Name').value;
        if (c2Name) {
            children.push({
                name: c2Name,
                age: parseInt(document.getElementById('child2Age').value) || 0,
                grade: document.getElementById('child2Grade').value,
                school_status: document.getElementById('child2Status').value,
                interests: document.getElementById('child2Interests').value
            });
        }

        const payload = {
            email: document.getElementById('email').value, // Required by schema but ignored by backend update logic usually
            password: "dummy", // Schema might require it, need to check. Ideally update schema to separate update/create. 
            // Checking parents.py: uses ParentProfileCreate which requires password. 
            // We should send a dummy password or refactor backend to use a meaningful Update schema.
            // For now, sending dummy to satisfy Pydantic.
            full_name: fullName,
            phone: phone,
            location: location,
            skills: skills,
            experience: experience,
            availability: ["Morning", "Evening"], // Default or add form field
            children: children
        };

        const response = await fetch(`${API_URL}/register/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        alert("Profile updated successfully!");
        window.location.href = 'parent_dash.html';

    } catch (error) {
        console.error("Update failed:", error);
        alert("Failed to update profile: " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});
