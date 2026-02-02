// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Simple inline styles to avoid CSS dependency issues
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

  // Trigger animation
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


// Check authentication
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'recruiter') {
  window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadMyJobs();
  setupTabs();
  // Load profile data immediately
  loadProfile();
});

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  // Just ensure logic works
}

function showSection(sectionId, btn) {
  // Hide all sections
  document.querySelectorAll('.form-container, .listings-container').forEach(el => el.classList.add('hidden'));

  // Show target
  if (sectionId === 'post') document.getElementById('post-section').classList.remove('hidden');
  if (sectionId === 'listings') {
    document.getElementById('listings-section').classList.remove('hidden');
    loadMyJobs();
  }
  if (sectionId === 'profile') {
    document.getElementById('profile-section').classList.remove('hidden');
    loadProfile();
  }

  // Update tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// Post Job
const postJobForm = document.getElementById('postJobForm');
if (postJobForm) {
  postJobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = postJobForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "Publishing...";
    btn.disabled = true;

    // Collect requirements (skills)
    const skills = [];
    postJobForm.querySelectorAll('input[name="requirements"]:checked').forEach(cb => skills.push(cb.value));

    const jobData = {
      title: postJobForm.querySelector('input[name="title"]').value,
      location: postJobForm.querySelector('input[name="location"]').value,
      description: postJobForm.querySelector('textarea[name="description"]').value,
      frequency: postJobForm.querySelector('select[name="job_type"]').value, // Mapping 'job_type' to frequency
      wage: postJobForm.querySelector('input[name="wage"]').value + "/period", // Simple concatenation for string field
      skills_required: skills
    };

    try {
      await createJob(jobData);
      showToast("Job posted successfully!", "success");
      postJobForm.reset();
      showSection('listings', document.querySelectorAll('.tab')[1]); // Switch to listings
    } catch (error) {
      showToast("Error posting job: " + error.message, "error");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

async function loadMyJobs() {
  const container = document.getElementById('listings-section');
  const header = container.querySelector('.listings-header');

  try {
    const jobs = await getMyJobs();

    // Remove old cards (assuming they follow header)
    const oldCards = container.querySelectorAll('.job-card');
    oldCards.forEach(c => c.remove());

    if (jobs.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'job-card'; // Reuse style for padding
      emptyMsg.textContent = "No active job listings.";
      container.appendChild(emptyMsg);
      return;
    }

    jobs.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-card';
      card.id = `job-card-${job.id}`; // Add ID for easy removal
      card.innerHTML = `
                <div class="job-header">
                  <div>
                    <h4 class="job-title">${job.title}</h4>
                    <div class="job-meta">
                      <span>📍 ${job.location}</span>
                      <span>📅 Posted ${new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span class="status-badge status-active">Active</span>
                </div>
        
                <div class="job-details">
                  <div class="detail-section">
                    <h4>Work Type</h4>
                    <div class="detail-value">${job.frequency}</div>
                  </div>
                  <div class="detail-section">
                    <h4>Wage</h4>
                    <div class="detail-value">${job.wage}</div>
                  </div>
                  <div class="detail-section">
                    <h4>Applicants</h4>
                    <div class="detail-value">👥 <span id="applicant-count-${job.id}">0</span></div> 
                  </div>
                  <div class="detail-section">
                    <h4>Skills Required</h4>
                    <div class="skills-tags">
                      ${job.skills_required_list.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                    </div>
                  </div>
                </div>
        
                <div class="job-actions">
                  <button class="btn-action" onclick="viewApplicants(${job.id}, '${job.title}')">
                    👁 View Applicants
                  </button>
                  <button class="btn-action btn-delete" onclick="handleDeleteJob(${job.id})">🗑 Delete</button>
                </div>
            `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load jobs", error);
    if (container) {
      const errMsg = document.createElement('p');
      errMsg.className = 'job-card';
      errMsg.style.color = 'red';
      errMsg.textContent = "Error loading your job listings.";
      container.appendChild(errMsg);
    }
  }
}

async function handleDeleteJob(jobId) {
  if (!confirm("Are you sure you want to delete this job listing?")) return;

  // Visual feedback immediately
  const card = document.getElementById(`job-card-${jobId}`);
  if (card) card.style.opacity = '0.5';

  try {
    await deleteJob(jobId);
    showToast("Job deleted successfully", "success");
    if (card) {
      card.style.transition = 'all 0.5s ease';
      card.style.height = '0';
      card.style.opacity = '0';
      card.style.margin = '0';
      card.style.overflow = 'hidden';
      setTimeout(() => card.remove(), 500);
    }
  } catch (error) {
    showToast("Failed to delete job: " + error.message, "error");
    if (card) card.style.opacity = '1';
  }
}

async function viewApplicants(jobId, jobTitle) {
  try {
    const applicants = await getJobApplicants(jobId);

    // Update count
    const countEl = document.getElementById(`applicant-count-${jobId}`);
    if (countEl) countEl.textContent = applicants.length;

    // Show modal
    const modal = document.getElementById('applicants-viewer');
    modal.classList.remove('hidden');

    document.getElementById('applicant-job-title').textContent = `Applicants for: ${jobTitle}`;
    document.getElementById('applicant-count').textContent = `Total Applicants: ${applicants.length}`;

    const list = document.getElementById('applicant-list');
    list.innerHTML = '';

    if (applicants.length === 0) {
      list.innerHTML = '<p>No applicants yet.</p>';
      return;
    }

    applicants.forEach(app => {
      const card = document.createElement('div');
      card.className = 'applicant-card';
      card.id = `app-card-${app.application_id}`;
      // Store full parent data on the element for easy retrieval
      card.dataset.parent = JSON.stringify(app.parent);

      card.innerHTML = `
                <div>
                    <h5>${app.parent.name}</h5>
                    <p class="details-summary">
                        📍 ${app.parent.location} <br>
                        💼 Skills: ${app.parent.skills.slice(0, 2).join(', ')}...<br>
                        Status: <strong class="status-text">${app.status.toUpperCase()}</strong>
                    </p>
                    <button class="btn-contact" style="background-color: #6c757d; font-size: 0.8em; padding: 4px 8px; margin-top: 5px;" 
                            onclick="viewApplicantProfile(this)">
                        View Full Profile
                    </button>
                </div>
                <div class="action-area">
                    ${app.status === 'pending' ? `
                        <button class="btn-contact" style="background-color: green;" 
                            onclick="updateStatus(${app.application_id}, 'accepted', ${jobId})">
                            ✓ Accept
                        </button>
                        <button class="btn-contact" style="background-color: red;" 
                            onclick="updateStatus(${app.application_id}, 'rejected', ${jobId})">
                            ✗ Reject
                        </button>
                    ` : `<span style="color: gray;">Decision Made (${app.status})</span>`}
                </div>
            `;
      list.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load applicants", error);
    showToast("Error loading applicants", "error");
  }
}

function viewApplicantProfile(btn) {
  const card = btn.closest('.applicant-card');
  const parent = JSON.parse(card.dataset.parent);

  const content = document.getElementById('full-profile-content');
  content.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h4 style="color: #333; margin-bottom: 5px;">Contact Info</h4>
            <p><strong>Email:</strong> ${parent.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${parent.phone || 'N/A'}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <h4 style="color: #333; margin-bottom: 5px;">Professional Details</h4>
            <p><strong>Experience:</strong> ${parent.experience || 'Not provided'}</p>
            <p><strong>Skills:</strong> ${parent.skills.join(', ')}</p>
            <p><strong>Availability:</strong> ${parent.availability.join(', ')}</p>
        </div>
    `;

  document.getElementById('applicant-profile-modal').classList.remove('hidden');
}

function closeApplicantProfile() {
  document.getElementById('applicant-profile-modal').classList.add('hidden');
}

async function updateStatus(applicationId, status, jobId) {
  try {
    await updateApplicationStatus(applicationId, status);

    // Dynamic Update without reload
    const card = document.getElementById(`app-card-${applicationId}`);
    if (card) {
      const statusText = card.querySelector('.status-text');
      const actionArea = card.querySelector('.action-area');

      if (statusText) statusText.textContent = status.toUpperCase();
      if (actionArea) actionArea.innerHTML = `<span style="color: gray;">Decision Made (${status})</span>`;

      showToast(`Application ${status}!`, "success");
    } else {
      // Fallback if DOM element missing
      viewApplicants(jobId, document.getElementById('applicant-job-title').textContent.replace('Applicants for: ', ''));
    }

  } catch (error) {
    showToast("Error updating status: " + error.message, "error");
  }
}

function closeApplicants() {
  document.getElementById('applicants-viewer').classList.add('hidden');
}

async function loadProfile() {
  console.log("Loading recruiter profile...");
  try {
    const data = await getMyProfile();
    console.log("Recruiter data:", data);

    const profileSection = document.getElementById('profile-section');
    if (!profileSection) return;

    if (!data || !data.profile) {
      console.warn("No profile found");
      profileSection.querySelector('.profile-card').innerHTML = "<p>No profile data found.</p>";
      return;
    }

    const cards = profileSection.querySelectorAll('.profile-card');

    if (cards[0]) {
      cards[0].innerHTML = `
                  <h4>Organisation Details</h4>
                  <p><strong>Organisation Name:</strong> ${data.profile.org_name}</p>
                  <p><strong>Organisation Type:</strong> ${data.profile.org_type}</p>
                  <p><strong>Mission:</strong> ${data.profile.description}</p>
                  <p><strong>Location:</strong> ${data.profile.city}, ${data.profile.state}</p>
              `;
    }

    if (cards[1]) {
      cards[1].innerHTML = `
                  <h4>Primary Contact</h4>
                  <p><strong>Contact Name:</strong> ${data.profile.contact_name}</p>
                  <p><strong>Job Title:</strong> ${data.profile.job_title}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Phone:</strong> ${data.profile.phone}</p>
                  <p><strong>Website:</strong> ${data.profile.website || 'N/A'}</p>
              `;
    }
  } catch (error) {
    console.error("Failed to load profile", error);
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
      // Show visible error
      const firstCard = profileSection.querySelector('.profile-card');
      if (firstCard) firstCard.innerHTML = `<p style="color:red">Error: ${error.message}</p><button onclick="loadProfile()">Retry</button>`;
    }
  }
}
