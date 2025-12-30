document.getElementById('incidentReportForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    const formData = {
        incident_type: document.getElementById('incidentType').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        date: document.getElementById('date').value || null,
        time: document.getElementById('time').value ? document.getElementById('time').value + ":00" : null, // Add seconds if needed by Time type
        urgency: document.querySelector('input[name="urgency"]:checked').value,
        is_anonymous: document.getElementById('anonymous').checked,
        reporter_name: document.getElementById('reporterName').value,
        reporter_contact: document.getElementById('reporterContact').value
    };

    try {
        await submitReport(formData);

        // Reset form
        document.getElementById('incidentReportForm').reset();

        // Show success message (simple alert or custom UI)
        alert("Report submitted successfully. Thank you for helping protecting children.");

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        alert(error.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Character count logic (kept from original requirement if needed, or re-implemented)
const descInput = document.getElementById('description');
const charCountDiv = document.querySelector('.char-count');
if (descInput && charCountDiv) {
    descInput.addEventListener('input', function () {
        const len = this.value.length;
        charCountDiv.textContent = `Minimum 20 characters. Current: ${len}`;
        if (len < 20) {
            charCountDiv.style.color = "red";
        } else {
            charCountDiv.style.color = "green";
        }
    });
}
