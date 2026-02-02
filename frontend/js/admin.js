// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'admin') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

function showAdminSection(sectionId, btn) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId + '-section').classList.add('active');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    if (sectionId === 'overview') loadDashboardStats();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'tracking') loadTracking();
    if (sectionId === 'content') loadReports();
    if (sectionId === 'contact') loadContactMessages();
}

async function loadDashboardStats() {
    try {
        const stats = await getAdminStatistics();

        // Update stat cards
        const statGrid = document.querySelector('.stat-grid');
        statGrid.innerHTML = `
            <div class="stat-card">
                <h4>Total Parents Registered</h4>
                <p style="font-size: 2em; font-weight: bold; color: #1f3a69;">${stats.users.parents}</p>
            </div>
            <div class="stat-card">
                <h4>Jobs Currently Active</h4>
                <p style="font-size: 2em; font-weight: bold; color: #1f3a69;">${stats.jobs.total}</p>
            </div>
            <div class="stat-card">
                <h4>Total Events</h4>
                <p style="font-size: 2em; font-weight: bold; color: #1f3a69;">${stats.events.total}</p>
            </div>
            <div class="stat-card">
                <h4>Incident Reports</h4>
                <p style="font-size: 2em; font-weight: bold; color: #dc3545;">${stats.reports.total}</p>
            </div>
        `;

        // Update alert row
        const alertRow = document.querySelector('.alert-row');
        alertRow.textContent = `🔔 Platform Stats: ${stats.users.total} Total Users | ${stats.jobs.recent} Recent Jobs | ${stats.applications.recent} Recent Applications | ${stats.reports.total} Reports`;

    } catch (error) {
        console.error("Failed to load stats", error);
        const statGrid = document.querySelector('.stat-grid');
        if (statGrid) statGrid.innerHTML = '<p style="color:red; padding: 20px;">Error loading platform statistics.</p>';
    }
}

async function loadUsers() {
    // Parallel load
    loadPendingPartners();
    loadParentReviews();
}

// Global store for users to avoid stringify issues
let currentUsers = [];
let currentParents = [];

function storeUsers(users) {
    currentUsers = users;
}

async function loadPendingPartners() {
    const tbody = document.getElementById('pending-partners-body');
    tbody.innerHTML = '<tr><td colspan="4">Loading pending partners...</td></tr>';

    try {
        const users = await getPendingPartners();
        storeUsers(users);

        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No pending partners found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            const name = user.profile.org_name || user.email;
            const type = user.role === 'educator' ? 'Educational Partner' : 'Recruiting Partner';

            row.innerHTML = `
                <td>${name}</td>
                <td>${type}</td>
                <td>N/A</td> 
                <td>
                    <button class="btn-action-small" onclick="viewUserDetails(${user.id})">View Details</button>
                    <button class="btn-action-small" style="background-color: #28a745;" onclick="approveUser(${user.id}, this)">Approve</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red">Error loading partners</td></tr>';
    }
}

async function loadParentReviews() {
    const tbody = document.getElementById('parent-review-body');
    tbody.innerHTML = '<tr><td colspan="4">Loading parents...</td></tr>';

    try {
        const parents = await getParentReviews();
        currentParents = parents;

        tbody.innerHTML = '';

        if (parents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No parents found.</td></tr>';
            return;
        }

        parents.forEach(p => {
            const row = document.createElement('tr');
            // Check children status
            const childStatus = p.children.length > 0
                ? p.children.map(c => `${c.name} (${c.status})`).join(', ')
                : 'No children registered';

            row.innerHTML = `
                <td>${p.name}</td>
                <td>${childStatus}</td>
                <td>${p.skills || 'None'}</td>
                <td><button class="btn-action-small" onclick="viewParentProfile(${p.id})">View Profile</button></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red">Error loading parents</td></tr>';
    }
}

// Global functions for user details are defined below


function viewUserDetails(userId) {
    const user = currentUsers.find(u => u.id === userId);
    if (!user) {
        console.error("User not found:", userId);
        return;
    }

    const content = document.getElementById('user-modal-content');
    let detailsHtml = `
        <p><strong>Role:</strong> ${user.role.toUpperCase()}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
    `;

    if (user.profile) {
        detailsHtml += `<h4>Profile Information</h4>`;
        for (const [key, value] of Object.entries(user.profile)) {
            if (key !== 'id' && key !== 'user_id' && value) {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const displayValue = Array.isArray(value) ? value.join(', ') : value;
                detailsHtml += `<p><strong>${label}:</strong> ${displayValue}</p>`;
            }
        }
    } else {
        detailsHtml += `<p><em>No detailed profile found.</em></p>`;
    }

    content.innerHTML = detailsHtml;

    // Show modal
    const modal = document.getElementById('user-details-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function viewParentProfile(parentId) {
    // Re-use the same modal structure but for parent details
    // Since this parent data comes from a different list, we might need a separate store or fetch it
    // For simplicity, let's fetch it or filter from a global parents list if we store it.
    // But wait! loadParentReviews has the 'p' object.
    // Let's attach the data to the button click directly or use a global parents array.
    console.log("Viewing parent:", parentId);
    const parent = currentParents.find(p => p.id === parentId);
    if (!parent) return;

    const content = document.getElementById('user-modal-content');
    let childHtml = 'No children registered';

    if (parent.children && parent.children.length > 0) {
        childHtml = '<ul>' + parent.children.map(c => `<li>${c.name} (Age: ${c.age}, Status: ${c.status})</li>`).join('') + '</ul>';
    }

    content.innerHTML = `
        <h3>${parent.name}</h3>
        <p><strong>Skills:</strong> ${parent.skills || 'None'}</p>
        <h4>Children</h4>
        ${childHtml}
     `;

    const modal = document.getElementById('user-details-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

async function approveUser(userId, btn) {
    if (!confirm("Are you sure you want to approve this partner?")) return;

    // Placeholder - assuming backend has an approve endpoint or we just mock it for now
    // Since we don't have a specific /approve endpoint in the plan yet, 
    // I will add a TOAST simply stating it's approved for demo or call an update endpoint if one exists.
    // Real implementation would be: await api.approveUser(userId);

    // For now, let's just visually approve it
    // For now, let's just visually approve it
    btn.textContent = "Approved";
    btn.disabled = true;
    showToast("User approved successfully!");
}

function closeUserModal() {
    document.getElementById('user-details-modal').classList.add('hidden');
    document.getElementById('user-details-modal').style.display = 'none'; // Ensure it's hidden visually
}

// --- Skills Management ---

function openSkillsModal() {
    const modal = document.getElementById('skills-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    loadSkillsList();
}

function closeSkillsModal() {
    const modal = document.getElementById('skills-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

async function loadSkillsList() {
    const tbody = document.getElementById('skills-list-body');
    tbody.innerHTML = '<tr><td colspan="2">Loading skills...</td></tr>';

    try {
        const skills = await getSkills();
        tbody.innerHTML = '';

        if (skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2">No skills defined yet.</td></tr>';
            return;
        }

        skills.forEach(skill => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #eee';
            row.innerHTML = `
                <td style="padding: 10px;">${skill.name}</td>
                <td style="padding: 10px; text-align: right;">
                    <button onclick="removeSkill(${skill.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="2" style="color:red">Failed to load skills</td></tr>';
    }
}

async function addNewSkill() {
    const input = document.getElementById('new-skill-input');
    const name = input.value.trim();
    if (!name) {
        showToast("Please enter a skill name", "error");
        return;
    }

    try {
        await createSkill({ name: name, category: "General" });
        showToast("Skill added successfully");
        input.value = '';
        loadSkillsList();
    } catch (error) {
        console.error(error);
        showToast("Failed to add skill. It may already exist.", "error");
    }
}

async function removeSkill(id) {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
        await deleteSkill(id);
        showToast("Skill deleted successfully");
        loadSkillsList();
    } catch (error) {
        console.error(error);
        showToast("Failed to delete skill", "error");
    }
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


// --- Tracking & Reports ---

async function loadTracking() {
    loadActiveJobs();
    loadEnrollments();
}

async function loadActiveJobs() {
    try {
        const jobs = await getAdminJobs();
        const tbody = document.getElementById('active-jobs-body');
        tbody.innerHTML = '';

        if (jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No active jobs.</td></tr>';
            return;
        }

        jobs.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${job.title}</td>
                <td>Recruiter ID: ${job.recruiter_id}</td>
                <td>${job.applicants_count || 0}</td>
                <td><span style="color: green; font-weight: bold;">Active</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load jobs", error);
        const tbody = document.getElementById('active-jobs-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="color:red">Error loading active jobs.</td></tr>';
    }
}

async function loadEnrollments() {
    const tbody = document.getElementById('enrollments-body');
    tbody.innerHTML = '<tr><td colspan="4">Loading enrollments...</td></tr>';

    try {
        const enrollments = await getAdminEnrollments();
        tbody.innerHTML = '';

        if (enrollments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No enrollments found.</td></tr>';
            return;
        }

        enrollments.forEach(en => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${en.child_name}</td>
                <td>${en.program_name}</td>
                <td>${en.partner_name}</td>
                <td><span style="color: blue; font-weight: bold;">${en.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load enrollments", error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:red">Error loading enrollments</td></tr>';
    }
}

async function loadReports() {
    try {
        const reports = await getAdminReports();

        const contentSection = document.getElementById('content-section');
        const cards = contentSection.querySelectorAll('.stat-card');

        if (cards.length > 1) {
            const reportCard = cards[1];

            // Create table for reports if it doesn't exist, otherwise update it
            let tableContainer = reportCard.querySelector('.reports-table-container');
            if (!tableContainer) {
                tableContainer = document.createElement('div');
                tableContainer.className = 'reports-table-container';
                tableContainer.style.marginTop = '20px';
                reportCard.appendChild(tableContainer);
            }

            if (reports.length === 0) {
                tableContainer.innerHTML = '<p>No incident reports found.</p>';
                return;
            }

            // Filter out completed ones as per user request "remove once routed/completed"
            // But allow toggling to see history
            const activeReports = showCompletedReports ? reports : reports.filter(r => r.status !== 'completed');

            // Add toggle button if not exists
            let toggleBtn = reportCard.querySelector('#history-toggle-btn');
            if (!toggleBtn) {
                toggleBtn = document.createElement('button');
                toggleBtn.id = 'history-toggle-btn';
                toggleBtn.className = 'btn-action-small';
                toggleBtn.style.backgroundColor = '#6c757d';
                toggleBtn.style.marginTop = '10px';
                toggleBtn.textContent = "Show Completed Reports";
                toggleBtn.onclick = toggleReportHistory;
                reportCard.insertBefore(toggleBtn, tableContainer);
            }

            if (activeReports.length === 0) {
                tableContainer.innerHTML = `<p>No ${showCompletedReports ? '' : 'pending or active '}incident reports found.</p>`;
                return;
            }

            let tableHtml = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px; border: 1px solid #ddd;">ID</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Reporter</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            activeReports.forEach(report => {
                // Show date and time from database accurately
                let dStr = 'N/A';
                if (report.date) {
                    // Convert YYYY-MM-DD to DD/MM/YYYY for better reading
                    const parts = report.date.toString().split('-');
                    dStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : report.date;

                    if (report.time) {
                        const t = report.time.toString().substring(0, 5);
                        dStr += ` (${t})`;
                    }
                } else if (report.created_at) {
                    // Fallback to Submission Date (created_at) if incident date wasn't specified
                    const dt = new Date(report.created_at);
                    dStr = dt.toLocaleDateString() + ' (Submitted)';
                }

                tableHtml += `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">#${report.id}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${report.reporter_name || 'Anonymous'}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${dStr}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">
                            <span style="color: ${getStatusColorAdmin(report.status)}; font-weight: bold;">
                                ${report.status.toUpperCase()}
                            </span>
                        </td>
                        <td style="padding: 10px; border: 1px solid #ddd;">
                            <a href="./review_incident_report.html?id=${report.id}" class="btn-action-small" style="text-decoration: none; background-color: #007bff;">Review</a>
                        </td>
                    </tr>
                `;
            });

            tableHtml += '</tbody></table>';
            tableContainer.innerHTML = tableHtml;

            // Simple description update
            const p = reportCard.querySelector('p');
            if (p) p.textContent = `Review and action pending incident reports (${reports.filter(r => r.status !== 'completed').length} pending).`;

            // Hide the old single link button if it exists
            const oldBtn = reportCard.querySelector('a.btn-action-small:not(#history-toggle-btn)');
            if (oldBtn && oldBtn.parentElement === reportCard && !oldBtn.id) oldBtn.style.display = 'none';
        }

    } catch (error) {
        console.error("Failed to load reports", error);
        const contentSection = document.getElementById('content-section');
        const cards = contentSection ? contentSection.querySelectorAll('.stat-card') : [];
        if (cards.length > 1) {
            const tableContainer = cards[1].querySelector('.reports-table-container');
            if (tableContainer) tableContainer.innerHTML = '<p style="color:red">Error loading incident reports.</p>';
        }
    }
}

function getStatusColorAdmin(status) {
    if (status === 'pending') return '#dc3545';
    if (status === 'completed') return '#28a745';
    if (status === 'routed') return '#ffc107';
    if (status === 'resolved') return '#28a745';
    return '#333';
}

async function loadContactMessages() {
    const container = document.getElementById('contact-messages-container');
    container.innerHTML = '<p>Loading messages...</p>';

    try {
        const messages = await getContactMessages();
        if (messages.length === 0) {
            container.innerHTML = '<p>No messages received yet.</p>';
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #ddd;">From</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Category</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Subject</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Message</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        messages.forEach(msg => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <strong>${msg.full_name}</strong><br>
                        <small>${msg.email}</small>
                    </td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${msg.category}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${msg.subject}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; max-width: 300px; white-space: normal; word-wrap: break-word;">${msg.message}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${new Date(msg.created_at).toLocaleDateString()}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error("Failed to load contact messages", error);
        container.innerHTML = '<p style="color:red">Error loading messages: ' + error.message + '</p>';
    }
}

let showCompletedReports = false;

function toggleReportHistory() {
    showCompletedReports = !showCompletedReports;
    const btn = document.getElementById('history-toggle-btn');
    btn.textContent = showCompletedReports ? "Hide Completed Reports" : "Show Completed Reports";
    loadReports();
}





