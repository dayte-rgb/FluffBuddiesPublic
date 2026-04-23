// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('search-form');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            const username = loginForm.querySelector('input[name="username"]').value.trim();
            const password = loginForm.querySelector('input[name="password"]').value.trim();

            if (!username || !password) {
                event.preventDefault();
                alert('Please enter both username/email and password.');
                return false;
            }
        });
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            console.log('Forgot password link clicked');
        });
    }
});