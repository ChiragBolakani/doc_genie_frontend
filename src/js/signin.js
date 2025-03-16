import { setCookie } from "./cookie_utils.js";
import { getJWTExpiration } from "./token_utils.js";

// function to handle login
export async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://doc-genie-backend-316971717795.asia-south1.run.app/api/v1/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)

        // Get expiration times from tokens
        const accessExpiry = getJWTExpiration(data.access);
        const refreshExpiry = getJWTExpiration(data.refresh);

        // Set cookies with expiration from JWT
        setCookie('access_token', data.access, accessExpiry);
        setCookie('refresh_token', data.refresh, refreshExpiry);
        setCookie('user_profile', JSON.stringify(data.user), refreshExpiry);

        // Redirect to dashboard or home page
        window.location.href = '/home.html'; // Adjust the redirect URL as needed

    } catch (error) {
        console.error('Error during login:', error);
        alert('Invalid credentials. Please try again.');
    }
}

if (window.location.href.includes("/signin.html")){
    document.addEventListener('DOMContentLoaded', ()=>{
        console.log(window.location.href.startsWith)
        // Add form submit event listener
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    })
}


