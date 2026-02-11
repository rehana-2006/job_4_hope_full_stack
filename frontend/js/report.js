document.getElementById('incidentReportForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    if (description.length < 20) {
        alert("Please provide a more detailed description (at least 20 characters).");
        return;
    }

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
        date: null,
        time: null,
        urgency: document.querySelector('input[name="urgency"]:checked').value,
        is_anonymous: document.getElementById('anonymous').checked,
        reporter_name: document.getElementById('reporterName').value,
        reporter_contact: document.getElementById('reporterContact').value
    };

    try {
        await submitReport(formData);

        document.getElementById('incidentReportForm').reset();

        alert("Report submitted successfully. Thank you for helping protecting children.");

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        alert(error.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});


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
