// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'parent') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    loadEvents();
    loadApplications();
    // Load profile data immediately
    loadProfile();
});

function showPage(pageId, btn) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    if (pageId === 'browse') loadJobs();
    if (pageId === 'events') loadEvents();
    if (pageId === 'applications') loadApplications();
    if (pageId === 'profile') loadProfile();
}

async function loadProfile() {
    const profileSection = document.getElementById('profile-page');
    if (!profileSection) return;

    try {
        const data = await getMyProfile();

        if (!data || !data.profile) {
            console.warn("No profile data found");
            const cards = profileSection.querySelectorAll('.profile-info-card');
            if (cards[0]) cards[0].innerHTML = '<h4>Personal & Contact Details</h4><p>No profile found. Please register first.</p>';
            return;
        }

        const cards = profileSection.querySelectorAll('.profile-info-card');

        // Update personal details card
        if (cards[0]) {
            try {
                cards[0].innerHTML = `
                    <h4>Personal & Contact Details</h4>
                    <p><strong>Name:</strong> ${data.profile.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${data.profile.phone || 'N/A'}</p>
                    <p><strong>Location:</strong> ${data.profile.location || 'N/A'}</p>
                `;
            } catch (e) { console.error("Error updating personal card:", e); }
        }

        // Update skills card
        if (cards[1]) {
            try {
                const skills = Array.isArray(data.profile.skills) ? data.profile.skills.join(', ') : 'None';
                const availability = Array.isArray(data.profile.availability) ? data.profile.availability.join(', ') : 'None';

                cards[1].innerHTML = `
                    <h4>My Skills & Experience</h4>
                    <p><strong>Skills:</strong> ${skills}</p>
                    <p><strong>Experience Summary:</strong> ${data.profile.experience || 'Not provided'}</p>
                    <p><strong>Availability:</strong> ${availability}</p>
                `;
            } catch (e) { console.error("Error updating skills card:", e); }
        }

        // Update children card
        if (cards[2]) {
            try {
                let childrenList = '';
                if (data.profile.children && data.profile.children.length > 0) {
                    childrenList = data.profile.children.map((child, idx) => `
                        <li>
                            <strong>Child ${idx + 1}:</strong> ${child.name}, Age ${child.age}, 
                            ${child.school_status}. Interests: ${child.interests || 'None listed'}
                        </li>
                    `).join('');
                } else {
                    childrenList = '<li>No children registered</li>';
                }

                cards[2].innerHTML = `
                    <h4>Children's Education & Safety</h4>
                    <p><strong>Number of Children (5-18):</strong> ${data.profile.children ? data.profile.children.length : 0}</p>
                    <ul>${childrenList}</ul>
                    <p class="help-text">
                        We are actively matching your children with our educational partners based on this information.
                    </p>
                `;
            } catch (e) { console.error("Error updating children card:", e); }
        }
    } catch (error) {
        // Show error in the first card so user sees it
        const cards = profileSection.querySelectorAll('.profile-info-card');
        if (cards[0]) {
            cards[0].innerHTML = `
                <h4>Error Loading Profile</h4>
                <p style="color: red;">${error.message}</p>
                <button onclick="loadProfile()" class="btn btn-sm">Retry</button>
            `;
        }
    }
}

let allJobs = []; // Global store for modal access

async function loadJobs(filters = {}) {
    const container = document.querySelector('#browse-page .job-listings');
    container.innerHTML = '<p>Loading jobs...</p>'; // Simple loader

    try {
        const jobs = await getJobs(filters);
        allJobs = jobs; // Store for modal
        container.innerHTML = '';

        if (jobs.length === 0) {
            container.innerHTML = '<p>No jobs found.</p>';
            return;
        }

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <span class="urgent-badge">New</span>
                <h3>${job.title}</h3>
                <p class="org-name">Posted by Recruiter</p> 
                <p class="job-description">${job.description.substring(0, 100)}...</p>

                <div class="job-meta">
                    <div class="job-meta-item">📍 ${job.location}</div>
                    <div class="job-meta-item">⏰ ${job.frequency}</div>
                    <div class="job-meta-item">⭐ ${job.wage}</div>
                </div>

                <div class="opportunity-tags">
                   ${job.skills_required_list.slice(0, 3).map(s => `<span class="tag">${s}</span>`).join('')}
                   ${job.skills_required_list.length > 3 ? '<span class="tag">+More</span>' : ''}
                </div>

                <div class="job-actions">
                    <button class="btn btn-apply" onclick="handleApply(${job.id}, this)">Apply Now</button>
                    <button class="btn btn-view" onclick="openJobDetails(${job.id})">View Details</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Error loading jobs.</p>';
    }
}

function openJobDetails(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById('job-details-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    document.getElementById('detail-title').textContent = job.title;
    document.getElementById('detail-location').textContent = `📍 ${job.location}`;
    document.getElementById('detail-wage').textContent = `💰 ${job.wage}`;
    document.getElementById('detail-freq').textContent = `⏰ ${job.frequency}`;
    document.getElementById('detail-desc').textContent = job.description;

    const skillsContainer = document.getElementById('detail-skills');
    skillsContainer.innerHTML = job.skills_required_list.map(s => `<span class="tag">${s}</span>`).join('');

    // Configure Apply button in modal
    const applyBtn = document.getElementById('detail-apply-btn');
    applyBtn.onclick = function () {
        handleApply(job.id, this);
        closeJobDetailsModal();
    };
}

function closeJobDetailsModal() {
    const modal = document.getElementById('job-details-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Toast Notification System
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

// ... application logic ...

async function handleApply(jobId, btnElement) {
    if (!confirm("Are you sure you want to apply for this job?")) return;

    const originalText = btnElement.textContent;
    btnElement.textContent = "Applying...";
    btnElement.disabled = true;

    try {
        await applyForJob(jobId);
        showToast("Application submitted successfully!", "success");
        btnElement.textContent = "Applied";
        btnElement.style.backgroundColor = "green";
    } catch (error) {
        showToast("Application failed: " + error.message, "error");
        btnElement.textContent = originalText;
        btnElement.disabled = false;
    }
}

async function loadApplications() {
    const container = document.querySelector('#applications-page .job-listings');
    container.innerHTML = '<p>Loading applications...</p>';

    // Load Job Applications
    try {
        const apps = await getMyApplications();
        container.innerHTML = '';

        if (apps.length === 0) {
            container.innerHTML = '<p>You have not applied to any jobs yet.</p>';
        } else {
            apps.forEach(app => {
                const card = document.createElement('div');
                card.className = 'application-card';
                card.innerHTML = `
                    <div class="application-info">
                       <h3>${app.job_title || 'Job #' + app.job_id}</h3>
                       <p class="org-name">${app.recruiter_name || 'Unknown Recruiter'}</p>
                       <p class="applied-date">
                            Applied on: ${new Date(app.applied_at).toLocaleDateString()}
                            ${app.location ? ` | 📍 ${app.location}` : ''}
                       </p>
                    </div>
                    <span class="status-badge status-${(app.status || 'pending').toLowerCase()}">${app.status || 'Pending'}</span>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Error loading apps:", error);
        if (error.message.includes("Could not validate credentials") || error.message.includes("401")) {
            // Avoid double alert if enrollments also fails, but for now simple is fine OR rely on the first one that hits.
            // Usually they run in parallel but let's just redirect.
            window.location.href = '../pages/sign_in.html';
            return;
        }
        container.innerHTML = '<p style="color:red">Error loading applications.</p>';
    }

    // Load Enrollments
    loadMyEnrollments();
}

let currentEnrollments = [];

async function loadMyEnrollments() {
    const container = document.getElementById('my-enrollments-list');
    container.innerHTML = '<p>Loading enrollments...</p>';

    try {
        const enrollments = await getMyEnrollments();
        currentEnrollments = enrollments; // Store for modal access
        container.innerHTML = '';

        if (enrollments.length === 0) {
            container.innerHTML = '<p>No event enrollments found.</p>';
            return;
        }

        enrollments.forEach((en, index) => {
            const card = document.createElement('div');
            card.className = 'application-card';

            card.innerHTML = `
                <div class="application-info">
                    <h3>${en.event_title || 'Event #' + en.event_id}</h3>
                    <p class="org-name">Event Date: ${en.event_date || 'N/A'}</p>
                    <p class="applied-date">
                        Child: <strong>${en.child_name}</strong> | Enrolled on: ${new Date(en.enrolled_at).toLocaleDateString()}
                        ${en.location ? ` | 📍 ${en.location}` : ''}
                    </p>
                </div>
                <span class="status-badge status-${(en.status || 'pending').toLowerCase()}">${en.status || 'Pending'}</span>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading enrollments:", error);

        // Check if it's an authentication error
        if (error.message && (error.message.includes("Could not validate credentials") || error.message.includes("401"))) {
            // Silently redirect to login - user session expired
            window.location.href = '../pages/sign_in.html';
            return;
        }

        // Check if it's a network error (backend not running)
        if (error.message && error.message.includes("Failed to fetch")) {
            container.innerHTML = '<p style="color:#666">Unable to load enrollments. Please make sure you are logged in and the server is running.</p>';
            return;
        }

        // Other errors - show generic message
        container.innerHTML = '<p style="color:#666">No enrollments to display at this time.</p>';
    }
}

function openEventDetails(index) {
    const en = currentEnrollments[index];
    if (!en) return;

    document.getElementById('event-detail-title').innerText = en.event_title || 'Event Details';
    document.getElementById('event-detail-location').innerText = `📍 ${en.location || 'Online'}`;
    document.getElementById('event-detail-date').innerText = `🗓️ ${en.event_date || 'TBD'}`;
    document.getElementById('event-detail-time').innerText = `⏰ ${en.event_time || ''}`;
    document.getElementById('event-detail-desc').innerText = en.event_description || 'No description available.';
    document.getElementById('event-detail-category').innerText = en.event_category || 'General';
    document.getElementById('event-detail-child').innerText = en.child_name;

    const modal = document.getElementById('event-details-modal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function closeEventDetailsModal() {
    const modal = document.getElementById('event-details-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
}



async function loadEvents() {
    const container = document.querySelector('#events-page .event-listings');
    // Keep header logic if needed, but here simple clear
    // container.innerHTML = ''; // Careful not to clear fixed headers

    // Finding a place to append inside .event-listings, but it contains H3. 
    // Let's look for .event-card and remove them or create a wrapper
    const oldCards = container.querySelectorAll('.event-card');
    oldCards.forEach(c => c.remove());

    try {
        const events = await getEvents();
        if (events.length === 0) {
            const p = document.createElement('p');
            p.className = 'event-card';
            p.textContent = "No upcoming events.";
            container.appendChild(p);
            return;
        }

        events.forEach(evt => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <span class="urgent-badge">${evt.category}</span>
                <h3>${evt.title}</h3>
                <p class="org-name">Educator ID: ${evt.educator_id}</p>
                <p class="event-description">${evt.description}</p>
                
                <div class="event-meta">
                    <div class="event-meta-item">📍 ${evt.location}</div>
                    <div class="event-meta-item">🗓️ ${evt.date}</div>
                    <div class="event-meta-item">⏰ ${evt.time}</div>
                </div>

                <div class="event-actions">
                    <button class="btn btn-register" onclick="openEnrollmentModal(${evt.id}, '${evt.title}')">Register Now</button>
                </div>
             `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
    }
}

// Enrollment Logic
async function openEnrollmentModal(eventId, eventTitle) {
    const modal = document.getElementById('enrollment-modal');
    modal.classList.remove('hidden'); // Remove hidden class if used in CSS
    modal.style.display = 'flex'; // Ensure flex for centering

    document.getElementById('enroll-event-id').value = eventId;
    document.getElementById('modal-event-title').textContent = eventTitle;

    const select = document.getElementById('child-select');
    select.innerHTML = '<option value="">Loading children...</option>';

    try {
        // reuse getMyProfile to fetch children
        const data = await getMyProfile();

        select.innerHTML = '<option value="">-- Select a child --</option>';

        if (data.profile && data.profile.children && data.profile.children.length > 0) {
            data.profile.children.forEach(child => {
                const opt = document.createElement('option');
                opt.value = child.name;
                opt.textContent = `${child.name} (Age: ${child.age})`;
                select.appendChild(opt);
            });
        } else {
            const opt = document.createElement('option');
            opt.textContent = "No children registered";
            opt.disabled = true;
            select.appendChild(opt);
            showToast("Please add children to your profile first", "error");
        }
    } catch (error) {
        select.innerHTML = '<option value="">Error loading children</option>';
        console.error("Failed to load children", error);
    }
}

function closeEnrollmentModal() {
    const modal = document.getElementById('enrollment-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Handle Form Submission
document.getElementById('enrollment-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventId = document.getElementById('enroll-event-id').value;
    const childName = document.getElementById('child-select').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    if (!childName) {
        showToast("Please select a child", "error");
        return;
    }

    btn.textContent = "Enrolling...";
    btn.disabled = true;

    try {
        await enrollInEvent(eventId, childName);
        showToast("Successfully enrolled!", "success");
        closeEnrollmentModal();
        // Reload the enrollments list to show the new enrollment
        loadMyEnrollments();
    } catch (error) {
        showToast("Enrollment failed: " + error.message, "error");
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

// Search filters integration
function filterJobs() {
    const query = document.getElementById('jobSearchInput').value;
    loadJobs({ skill: query });
}
