// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'parent') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadDynamicSkills();
    await loadProfileData();
});

async function loadDynamicSkills() {
    const skillsContainer = document.querySelector('.checkbox-group');
    if (!skillsContainer) return;

    try {
        const skills = await getSkills();
        if (skills && skills.length > 0) {
            skillsContainer.innerHTML = '';
            skills.forEach(skill => {
                const label = document.createElement('label');
                label.className = 'checkbox-label';
                label.innerHTML = `
                    <input type="checkbox" name="skills" value="${skill.name}" />
                    <span>${skill.name}</span>
                `;
                skillsContainer.appendChild(label);
            });
        }
    } catch (error) {
        console.error("Failed to load skills dynamically:", error);
    }
}

function addChildBlock() {
    const hiddenBlocks = document.querySelectorAll('.child-details-static.optional-child');
    // Find the first hidden block
    for (let i = 0; i < hiddenBlocks.length; i++) {
        if (hiddenBlocks[i].style.display !== 'block') {
            hiddenBlocks[i].style.display = 'block';

            // If this was the last hidden block, hide the add button
            if (i === hiddenBlocks.length - 1) {
                document.querySelector('.btn-addChild').style.display = 'none';
                document.getElementById('limitMessage').style.display = 'block';
            }
            break;
        }
    }
}

function removeChildBlock(index) {
    const block = document.getElementById(`child${index}Block`);
    if (block) {
        block.style.display = 'none';
        // Clear all inputs in this block
        const inputs = block.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.value = '';
        });

        // Ensure the add button is visible again
        document.querySelector('.btn-addChild').style.display = 'flex';
        document.getElementById('limitMessage').style.display = 'none';
    }
}

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
                document.getElementById('child2Block').style.display = 'block';
                document.querySelector('.btn-addChild').style.display = 'none';
                document.getElementById('limitMessage').style.display = 'block';

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
    const fullName = document.getElementById('fullName').value;

    if (!validateName(fullName)) {
        alert("Please enter a valid full name (only letters and spaces, at least 2 characters).");
        return;
    }

    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
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
            if (!validateName(c1Name)) {
                alert("Please enter a valid name for Child 1 (only letters and spaces).");
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }
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
            if (!validateName(c2Name)) {
                alert("Please enter a valid name for Child 2 (only letters and spaces).");
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }
            children.push({
                name: c2Name,
                age: parseInt(document.getElementById('child2Age').value) || 0,
                grade: document.getElementById('child2Grade').value,
                school_status: document.getElementById('child2Status').value,
                interests: document.getElementById('child2Interests').value
            });
        }

        const payload = {
            full_name: fullName,
            phone: phone,
            location: location,
            skills: skills,
            experience: experience,
            availability: ["Morning", "Evening"],
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

function validateName(name) {
    const re = /^[A-Za-z\s]{2,50}$/;
    return re.test(name.trim());
}
