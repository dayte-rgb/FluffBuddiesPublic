/**
 * Create Job Page - Client-side functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.create-job-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Validate form before submission
            if (!validateForm()) {
                e.preventDefault();
            }
        });
    }

    // Set minimum datetime to current datetime
    setMinDateTime();
});

/**
 * Validate the create job form
 */
function validateForm() {
    const description = document.getElementById('description').value.trim();
    const datetime = document.getElementById('datetime').value;
    const duration = document.getElementById('duration').value;
    const zipcode = document.getElementById('zipcode').value.trim();
    const employee_num = document.getElementById('employee_num').value;

    // Check if description is not empty
    if (!description || description.length < 10) {
        showAlert('Description must be at least 10 characters long.', 'error');
        return false;
    }

    // Check if datetime is selected
    if (!datetime) {
        showAlert('Please select a date and time.', 'error');
        return false;
    }

    // Check if duration is valid
    if (!duration || duration <= 0) {
        showAlert('Duration must be a positive number.', 'error');
        return false;
    }

    // Check if zipcode is valid
    if (!zipcode || zipcode.length < 5) {
        showAlert('Please enter a valid zip code.', 'error');
        return false;
    }

    // Check if employee_num is valid
    if (!employee_num || employee_num <= 0) {
        showAlert('Please enter a valid employee ID.', 'error');
        return false;
    }

    return true;
}

/**
 * Set minimum datetime to current datetime
 */
function setMinDateTime() {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('datetime').min = minDateTime;
}

/**
 * Show temporary alert message
 */
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fa-solid fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;

    const formTitle = document.querySelector('.form-title');
    formTitle.parentElement.insertBefore(alertDiv, formTitle.nextElementSibling);

    // Remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
