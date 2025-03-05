import { setCookie } from "./cookie_utils";
import { getJWTExpiration } from "./token_utils";

// function to handle signup
async function handleSignup(event) {
    event.preventDefault();

    // Get form values
    const email = document.getElementById('email').value;
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    const name = document.getElementById('name').value;

    // Basic validation
    if (password1 !== password2) {
        alert("Passwords don't match!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/v1/auth/registration/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password1,
                password2,
                name: name || null // Only send name if it's provided
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Get expiration times from tokens
        const accessExpiry = getJWTExpiration(data.access);
        const refreshExpiry = getJWTExpiration(data.refresh);

        // Set cookies with expiration from JWT
        setCookie('access_token', data.access, accessExpiry);
        setCookie('refresh_token', data.refresh, refreshExpiry);
        setCookie('user_profile', JSON.stringify(data.user), refreshExpiry);

        // Redirect to dashboard or home page
        window.location.href = '/'; // Adjust the redirect URL as needed

    } catch (error) {
        console.error('Error during signup:', error);
        alert('Failed to sign up. Please try again.');
    }
}


// Add form submit event listener
document.getElementById('signupForm').addEventListener('submit', handleSignup);

// Optional: Add password match validation in real-time
document.getElementById('password2').addEventListener('input', function () {
    const password1 = document.getElementById('password1').value;
    const password2 = this.value;

    if (password1 !== password2) {
        this.setCustomValidity("Passwords don't match");
    } else {
        this.setCustomValidity('');
    }
});
