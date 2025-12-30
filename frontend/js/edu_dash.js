// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'educator') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadMyEvents();
    // Load profile data immediately
    loadProfile();
    // Default tab logic handled by inline attributes or we can init here
});

function showSection(sectionId, btn) {
    document.querySelectorAll('.form-container, .listings-container').forEach(el => el.classList.add('hidden'));

    if (sectionId === 'post') document.getElementById('post-section').classList.remove('hidden');
    if (sectionId === 'enrollments') {
        document.getElementById('enrollments-section').classList.remove('hidden');
        loadMyEvents();
    }
    if (sectionId === 'profile') {
        document.getElementById('profile-section').classList.remove('hidden');
        loadProfile();
    }

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

// Post Event
const postProgramForm = document.getElementById('postProgramForm');
if (postProgramForm) {
    postProgramForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = postProgramForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = "Publishing...";
        btn.disabled = true;

        const eventData = {
            title: postProgramForm.querySelector('input[name="title"]').value,
            location: postProgramForm.querySelector('input[name="location"]').value,
            description: postProgramForm.querySelector('textarea[name="description"]').value,
            // Mapping fields to schema
            category: postProgramForm.querySelector('select[name="program_type"]').value,
            date: postProgramForm.querySelector('input[name="start_date"]').value,
            time: "09:00:00" // Default time as form doesn't have it, or we add input
        };

        try {
            await createEvent(eventData);
            showToast("Program posted successfully!", "success");
            postProgramForm.reset();
            showSection('enrollments', document.querySelectorAll('.tab')[1]);
        } catch (error) {
            showToast("Error posting program: " + error.message, "error");
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// Toast Notification System (Reused from Recruiter Dash)
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    Object.assign(toast.style, {
        background: type === 'success' ? '#28a745' : '#dc3545',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        marginTop: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        opacity: '0',
        transition: 'opacity 0.3s ease-in-out',
        minWidth: '250px',
        textAlign: 'center'
    });

    container.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999'
    });
    document.body.appendChild(container);
    return container;
}

async function loadMyEvents() {
    const container = document.getElementById('enrollments-section');

    // Clear existing static content if any (first run)
    // We want to preserve the header though
    const header = container.querySelector('.listings-header') || container.querySelector('h3').parentNode;

    // Remove all card elements
    const oldCards = container.querySelectorAll('.enrollment-card');
    oldCards.forEach(c => c.remove());

    try {
        const events = await getMyEvents();

        if (events.length === 0) {
            const p = document.createElement('p');
            p.className = 'enrollment-card';
            p.textContent = "No active programs posted.";
            container.appendChild(p);
            return;
        }

        events.forEach(evt => {
            const card = document.createElement('div');
            card.className = 'enrollment-card';
            card.innerHTML = `
                <div class="job-header">
                    <div>
                        <h4 class="job-title">${evt.title}</h4>
                        <div class="job-meta">
                            <span>Category: ${evt.category}</span>
                            <span>📅 Start: ${evt.date}</span>
                        </div>
                    </div>
                    <span class="status-badge status-enrolled">Active</span>
                </div>
                <div class="enrollment-details">
                    <div><strong>Location:</strong> ${evt.location}</div>
                    <div><strong>Description:</strong> ${evt.description.substring(0, 50)}...</div>
                    <div><strong>Enrollments:</strong> ${evt.enrollment_count || 0}</div>
                </div>
                <div class="enrollment-actions">
                     <button class="btn-action btn-view" onclick="loadEnrollmentsForEvent(${evt.id}, '${evt.title.replace(/'/g, "\\'")}')">View Enrollments</button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Failed to load events", error);
    }
}

async function loadEnrollmentsForEvent(eventId, eventTitle) {
    document.getElementById('enrollment-modal-title').textContent = `Enrollments for "${eventTitle}"`;
    const list = document.getElementById('enrollment-list');
    list.innerHTML = '<p>Loading enrollments...</p>';

    const modal = document.getElementById('enrollment-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    try {
        const enrollments = await getEventEnrollments(eventId);

        list.innerHTML = ''; // Clear loading message

        if (enrollments.length === 0) {
            const p = document.createElement('p');
            p.textContent = "No enrollments found for this program.";
            list.appendChild(p);
            return;
        }

        enrollments.forEach(enr => {
            const item = document.createElement('div');
            item.className = 'enrollment-item';
            // Store full data
            item.dataset.enrollment = JSON.stringify(enr);

            item.style.borderBottom = '1px solid #eee';
            item.style.padding = '10px 0';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';

            item.innerHTML = `
                <div>
                    <strong>${enr.child_name || 'Child'}</strong> <br>
                    <span style="font-size:0.9em; color:#666">Parent: ${enr.parent ? enr.parent.name : 'Unknown'}</span><br>
                    <button onclick="viewStudentDetail(this)" style="background:none; border:none; color:#007bff; text-decoration:underline; cursor:pointer; padding:0; font-size:0.85em;">
                        View Contact & Details
                    </button>
                </div>
                <div style="text-align:right;">
                     <div style="margin-bottom:5px;">${(enr.status || 'pending').toUpperCase()}</div>
                    ${(enr.status || 'pending') === 'pending' ? `
                    <button onclick="updateStatus(${enr.enrollment_id}, 'enrolled', ${eventId}, '${eventTitle}')" 
                            style="background:green; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;">
                        Enroll
                    </button>
                    <button onclick="updateStatus(${enr.enrollment_id}, 'declined', ${eventId}, '${eventTitle}')"
                            style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                        Decline
                    </button>
                    ` : ''}
                </div>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        list.innerHTML = `<p style="color:red">Error loading enrollments: ${error.message}</p>`;
    }
}

async function updateStatus(enrollmentId, status, eventId, eventTitle) {
    if (!confirm(`Are you sure you want to mark this student as ${status.toUpperCase()}?`)) return;

    try {
        await updateEnrollmentStatus(enrollmentId, status);
        showToast(`Enrollment status updated to ${status}`, "success");
        // Reload list
        loadEnrollmentsForEvent(eventId, eventTitle);
    } catch (error) {
        console.error("Update failed", error);
        showToast("Failed to update status: " + error.message, "error");
    }
}

function viewStudentDetail(btn) {
    const item = btn.closest('.enrollment-item');
    const data = JSON.parse(item.dataset.enrollment);
    const parent = data.parent;

    const content = document.getElementById('student-detail-content');
    content.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h4 style="color: #333; margin-bottom: 5px;">Child Information</h4>
            <p><strong>Name:</strong> ${data.child_name}</p>
            <p><strong>Enrolled Date:</strong> ${new Date(data.enrolled_at || Date.now()).toLocaleDateString()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
             <h4 style="color: #333; margin-bottom: 5px;">Parent Contact Details</h4>
             <p><strong>Name:</strong> ${parent.name}</p>
             <p><strong>Phone:</strong> ${parent.phone || 'N/A'}</p>
             <p><strong>Email:</strong> ${parent.email || 'N/A'}</p>
             <p><strong>Location:</strong> ${parent.location || 'N/A'}</p>
        </div>
    `;

    const modal = document.getElementById('student-detail-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeStudentDetail() {
    const modal = document.getElementById('student-detail-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

function closeModal() {
    const modal = document.getElementById('enrollment-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

async function loadProfile() {
    console.log("Loading educator profile...");
    try {
        const data = await getMyProfile();
        console.log("Profile data:", data);

        if (!data || !data.profile) {
            console.warn("No profile data found");
            const cards = document.querySelectorAll('#profile-section .profile-card');
            if (cards[0]) cards[0].innerHTML = '<p>No profile information available. Please edit profile.</p>';
            return;
        }

        const p = data.profile;
        const cards = document.querySelectorAll('#profile-section .profile-card');

        // Card 1: Organisation Details
        if (cards[0]) {
            cards[0].innerHTML = `
                <h4>Organisation Details</h4>
                <p><strong>Org Name:</strong> ${p.org_name}</p>
                <p><strong>Type:</strong> ${p.org_type}</p>
                <p><strong>Description:</strong> ${p.description}</p>
                <p><strong>Capacity:</strong> ${p.capacity || 'N/A'}</p>
                <p><strong>Target Age:</strong> ${p.age_range || 'N/A'}</p>
                <p><strong>Location:</strong> ${p.city}, ${p.state}</p>
            `;
        }

        // Card 2: Specialization & Contact (Merging concepts as per HTML usually having 2 cards)
        // HTML has: "Specialization & Focus" as 2nd card title
        if (cards[1]) {
            cards[1].innerHTML = `
                <h4>Specialization & Focus</h4>
                <p><strong>Specialization:</strong> ${p.specialization ? p.specialization.join(', ') : 'None'}</p>
                <p><strong>Contact Person:</strong> ${p.contact_name}</p>
                <p><strong>Job Title:</strong> ${p.job_title}</p>
                <p><strong>Phone:</strong> ${p.phone}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Website:</strong> ${p.website || 'N/A'}</p>
            `;
        }

    } catch (error) {
        console.error("Failed to load profile", error);
        const section = document.getElementById('profile-section');
        if (section) {
            const errDiv = document.createElement('div');
            errDiv.innerHTML = `<p style="color:red">Error loading profile: ${error.message}</p>`;
            section.prepend(errDiv);
        }
    }
}
