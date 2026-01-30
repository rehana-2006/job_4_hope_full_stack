document.addEventListener('DOMContentLoaded', () => {
    loadDynamicSkills();
});

async function loadDynamicSkills() {
    const skillsContainer = document.querySelector('.checkbox-group');
    if (!skillsContainer) return;

    try {
        const skills = await getSkills();
        if (skills && skills.length > 0) {
            // Clear static skills and replace with dynamic ones
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

document.getElementById('parentRegForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = 'Creating Profile...';
    submitBtn.disabled = true;

    // Collect Skills
    const skills = [];
    document.querySelectorAll('input[name="skills"]:checked').forEach(cb => {
        skills.push(cb.value);
    });

    // Collect Availability
    const availability = [];
    document.querySelectorAll('input[name="availability"]:checked').forEach(cb => {
        availability.push(cb.value);
    });

    // Collect Children
    const children = [];

    // Child 1 (Always present)
    const c1Name = document.getElementById('child1Name').value;
    if (c1Name) {
        children.push({
            name: c1Name,
            age: parseInt(document.getElementById('child1Age').value) || 0,
            grade: document.getElementById('child1Grade').value || "",
            school_status: document.getElementById('child1Status').value,
            interests: document.getElementById('child1Interests').value || ""
        });
    }

    // Child 2 & 3
    for (let i = 2; i <= 3; i++) {
        const name = document.getElementById(`child${i}Name`).value;
        if (name) { // Only add if name is provided
            children.push({
                name: name,
                age: parseInt(document.getElementById(`child${i}Age`).value) || 0,
                grade: document.getElementById(`child${i}Grade`).value || "",
                school_status: document.getElementById(`child${i}Status`).value,
                interests: document.getElementById(`child${i}Interests`).value || ""
            });
        }
    }

    const payload = {
        full_name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        skills: skills,
        experience: document.getElementById('experience').value,
        children: children,
        availability: availability
    };

    try {
        await registerParent(payload);
        document.getElementById('parentRegForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        window.scrollTo(0, 0);
    } catch (error) {
        alert(error.message);
        submitBtn.textContent = 'Create Profile';
        submitBtn.disabled = false;
    }
});
