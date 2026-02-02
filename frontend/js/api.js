const API_URL =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000'
        : window.location.origin;

async function loginUser(email, password) {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
        const response = await fetch(`${API_URL}/token`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Login failed");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

async function registerParent(data) {
    try {
        const response = await fetch(`${API_URL}/register/parent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Registration failed: ${text}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function registerEducator(data) {
    try {
        const response = await fetch(`${API_URL}/register/educator`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Registration failed: ${text}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function registerRecruiter(data) {
    try {
        const response = await fetch(`${API_URL}/register/recruiter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Registration failed: ${text}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function submitReport(data) {
    try {
        const response = await fetch(`${API_URL}/reports/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Report submission failed: ${text}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function submitContact(data) {
    try {
        const response = await fetch(`${API_URL}/contact/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Contact submission failed: ${text}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Helper to get headers with token
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// --- Jobs API ---
async function createJob(data) {
    const response = await fetch(`${API_URL}/jobs/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getJobs(filters = {}) {
    let url = `${API_URL}/jobs/?`;
    if (filters.skill) url += `skill=${filters.skill}&`;
    if (filters.location) url += `location=${filters.location}&`;

    // Public endpoint for browsing
    const response = await fetch(url);
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getMyJobs() {
    const response = await fetch(`${API_URL}/jobs/my`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function deleteJob(jobId) {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return;
}

async function applyForJob(jobId) {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: "POST",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getMyApplications() {
    const response = await fetch(`${API_URL}/jobs/applications/my`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

// --- Events API ---
async function createEvent(data) {
    const response = await fetch(`${API_URL}/events/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getEvents(filters = {}) {
    let url = `${API_URL}/events/?`;
    if (filters.category) url += `category=${filters.category}&`;
    if (filters.location) url += `location=${filters.location}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getMyEvents() {
    const response = await fetch(`${API_URL}/events/my`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function enrollInEvent(eventId, childName) {
    const response = await fetch(`${API_URL}/events/${eventId}/enroll?child_name=${encodeURIComponent(childName)}`, {
        method: "POST",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

// --- Admin API ---
async function getAdminStatistics() {
    const response = await fetch(`${API_URL}/admin/statistics`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getAdminReports() {
    const response = await fetch(`${API_URL}/admin/reports`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getAdminUsers() {
    const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getAdminJobs() {
    const response = await fetch(`${API_URL}/admin/jobs`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getAdminEvents() {
    const response = await fetch(`${API_URL}/admin/events`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getAdminEnrollments() {
    const response = await fetch(`${API_URL}/admin/enrollments`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getPendingPartners() {
    const response = await fetch(`${API_URL}/admin/users/partners`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getParentReviews() {
    const response = await fetch(`${API_URL}/admin/users/parents_detailed`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

// --- Profile API ---
async function getMyProfile() {
    const response = await fetch(`${API_URL}/profile/me`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function updateParentProfile(data) {
    const response = await fetch(`${API_URL}/register/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function updateEducatorProfile(data) {
    const response = await fetch(`${API_URL}/profile/educator/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function updateRecruiterProfile(data) {
    // Assuming backend endpoint exists, likely needing creation if missing
    const response = await fetch(`${API_URL}/profile/recruiter/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

// --- Approval API ---
async function getJobApplicants(jobId) {
    const response = await fetch(`${API_URL}/jobs/${jobId}/applicants`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function updateApplicationStatus(applicationId, status) {
    const response = await fetch(`${API_URL}/jobs/applications/${applicationId}/status?status=${status}`, {
        method: "PUT",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getEventEnrollments(eventId) {
    const response = await fetch(`${API_URL}/events/${eventId}/enrollments`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}




async function updateEnrollmentStatus(enrollmentId, status) {
    const response = await fetch(`${API_URL}/events/enrollments/${enrollmentId}/status?status=${status}`, {
        method: "PUT",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

// --- Skills API ---
async function getSkills() {
    const response = await fetch(`${API_URL}/skills/`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function createSkill(data) {
    const response = await fetch(`${API_URL}/skills/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function deleteSkill(skillId) {
    const response = await fetch(`${API_URL}/skills/${skillId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return;
}

async function getMyEnrollments() {
    const response = await fetch(`${API_URL}/events/enrollments/my`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

async function getContactMessages() {
    const response = await fetch(`${API_URL}/contact/`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}
