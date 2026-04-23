// Sign Up Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            // Get form values
            const username = signupForm.querySelector('input[name="username"]').value.trim();
            const email = signupForm.querySelector('input[name="email"]').value.trim();
            const password = signupForm.querySelector('input[name="password"]').value.trim();
            const confirmPassword = signupForm.querySelector('input[name="confirm_password"]').value.trim();
            const phone = signupForm.querySelector('input[name="phone_number"]').value.trim();
            const zipcode = signupForm.querySelector('input[name="zipcode"]').value.trim();
            const accountType = signupForm.querySelector('select[name="account_type"]').value;

            // Validate all fields are filled
            if (!username || !email || !password || !confirmPassword || !phone || !zipcode || !accountType) {
                event.preventDefault();
                alert('Please fill in all fields.');
                return false;
            }

            // Validate username length
            if (username.length < 3) {
                event.preventDefault();
                alert('Username must be at least 3 characters long.');
                return false;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                event.preventDefault();
                alert('Please enter a valid email address.');
                return false;
            }

            // Validate password length
            if (password.length < 6) {
                event.preventDefault();
                alert('Password must be at least 6 characters long.');
                return false;
            }

            // Validate passwords match
            if (password !== confirmPassword) {
                event.preventDefault();
                alert('Passwords do not match.');
                return false;
            }

            // Validate phone number (basic check - at least 10 digits)
            const phoneDigits = phone.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                event.preventDefault();
                alert('Please enter a valid phone number.');
                return false;
            }

            // Validate zipcode (basic check - at least 5 characters)
            if (zipcode.length < 5) {
                event.preventDefault();
                alert('Please enter a valid zipcode.');
                return false;
            }

            // If all validations pass, form will submit normally
        });
    }
});