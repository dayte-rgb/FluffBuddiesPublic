const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');

if (loginButton) {
    loginButton.addEventListener("click", function(event) {
        window.location.href = '/login';
    });
} else {
    console.error('Login button not found');
}

if (signupButton) {
    signupButton.addEventListener("click", function(event) {
        // TODO: Navigate to signup page when implemented
        alert('Sign up functionality coming soon!');
    });
} else {
    console.error('Signup button not found');
}