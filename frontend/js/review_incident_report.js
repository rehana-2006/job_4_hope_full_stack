
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token || userRole !== 'admin') {
    window.location.href = '../pages/sign_in.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (reportId) {
        loadSpecificReport(reportId);
    } else {
        loadLatestReport();
    }
});

let currentReportId = null;

async function loadLatestReport() {
    const reportContent = document.getElementById('report-content');
    const actionSection = document.getElementById('action-section');

    reportContent.innerHTML = '<p>Loading latest report...</p>';

    try {
        const response = await fetch(`${API_URL}/admin/reports`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch reports');

        const reports = await response.json();

        if (reports.length === 0) {
            reportContent.innerHTML = '<p>No reports found.</p>';
            actionSection.classList.add('hidden');
            return;
        }

        const report = reports[0]; // Most recent
        displayReport(report);

    } catch (error) {
        console.error("Error:", error);
        reportContent.innerHTML = '<p style="color:red">Error loading report details.</p>';
    }
}

async function loadSpecificReport(reportId) {
    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = '<p>Loading report detail...</p>';

    try {
        const response = await fetch(`${API_URL}/admin/reports`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch reports');

        const reports = await response.json();
        const report = reports.find(r => r.id == reportId);

        if (!report) {
            reportContent.innerHTML = `<p style="color:red">Report #${reportId} not found.</p>`;
            return;
        }

        displayReport(report);

    } catch (error) {
        console.error("Error:", error);
        reportContent.innerHTML = '<p style="color:red">Error loading report detail.</p>';
    }
}

function displayReport(report) {
    const reportContent = document.getElementById('report-content');
    const actionSection = document.getElementById('action-section');

    currentReportId = report.id;

    let formattedDate = 'N/A';
    if (report.date) {
        formattedDate = typeof report.date === 'string' ? report.date : new Date(report.date).toLocaleDateString();

        if (report.time) {
            const t = report.time.toString().substring(0, 5);
            formattedDate += ` at ${t}`;
        }
    } else if (report.created_at) {
        const dt = new Date(report.created_at);
        formattedDate = dt.toLocaleDateString() + ' (Submission Date)';
    }

    reportContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Incident #${report.id}</h3>
            <a href="./admin.html" style="font-size: 0.9em; color: #007bff;">View All Reports</a>
        </div>
        <div class="detail-row">
            <strong>Reporter:</strong> <span>${report.reporter_name || 'Anonymous'} (${report.reporter_role || 'Visitor'})</span>
        </div>
        <div class="detail-row">
            <strong>Date:</strong> <span>${formattedDate}</span>
        </div>
        <div class="detail-row">
            <strong>Description:</strong> <span>${report.description}</span>
        </div>
        <div class="detail-row">
            <strong>Status:</strong> <span style="font-weight:bold; color:${getStatusColor(report.status)}">${report.status.toUpperCase()}</span>
        </div>
    `;

    actionSection.classList.remove('hidden');
}

function getStatusColor(status) {
    if (status === 'pending') return '#dc3545'; 
    if (status === 'completed') return '#28a745'; 
    if (status === 'routed') return '#ffc107'; 
    if (status === 'resolved') return '#28a745'; 
    return '#333';
}

async function updateReportStatus(newStatus) {
    if (!currentReportId) return;

    const targetStatus = (newStatus === 'routed') ? 'completed' : newStatus;

    if (!confirm(`Are you sure you want to mark this report as ${targetStatus.toUpperCase()}?`)) return;

    try {
        const response = await fetch(`${API_URL}/admin/reports/${currentReportId}/status?status=${targetStatus}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to update status');
        }

        alert(`Report #${currentReportId} has been ${targetStatus} successfully.`);
        window.location.href = 'admin.html'; 

    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status: " + error.message);
    }
}
