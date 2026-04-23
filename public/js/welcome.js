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
        window.location.href = '/signup';
    });
} else {
    console.error('Signup button not found');
}