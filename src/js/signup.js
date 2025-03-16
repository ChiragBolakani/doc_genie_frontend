import { setCookie } from "./cookie_utils.js";
import { getJWTExpiration } from "./token_utils.js";

// Password validation functions
const validatePasswordLength = (password) => {
    const minLength = 8; // Django's default minimum length
    return password.length >= minLength;
};

const validateNumericPassword = (password) => {
    // Check if password is not entirely numeric
    return !/^\d+$/.test(password);
};

// Function to validate password and return error messages
const validatePassword = (password) => {
    const errors = [];
    
    if (!validatePasswordLength(password)) {
        errors.push("Password must be at least 8 characters long.");
    }
    
    if (!validateNumericPassword(password)) {
        errors.push("Password cannot be entirely numeric.");
    }
    
    return errors;
};

// function to handle signup
export async function handleSignup(event) {
    event.preventDefault();

    // Get form values
    const email = document.getElementById('email').value;
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    const name = document.getElementById('name').value;

    // Password validation
    const passwordErrors = validatePassword(password1);
    if (passwordErrors.length > 0) {
        alert(passwordErrors.join('\n'));
        return;
    }

    // Check if passwords match
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
                name: name || null
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Signup failed');
        }

        const data = await response.json();

        // Get expiration times from tokens
        const accessExpiry = getJWTExpiration(data.access);
        const refreshExpiry = getJWTExpiration(data.refresh);

        // Redirect to signin page
        window.location.href = '/signin.html';

    } catch (error) {
        console.error('Error during signup:', error);
        alert(error.message || 'Failed to sign up. Please try again.');
    }
}

if (window.location.href.includes("/signup.html")) {
    document.addEventListener('DOMContentLoaded', () => {
        const password1Input = document.getElementById('password1');
        const password2Input = document.getElementById('password2');
        const signupForm = document.getElementById('signupForm');

        // Real-time password validation
        password1Input.addEventListener('input', function() {
            const errors = validatePassword(this.value);
            
            // Update validation message
            let validationMessage = '';
            if (errors.length > 0) {
                validationMessage = errors.join('\n');
                this.setCustomValidity(validationMessage);
            } else {
                this.setCustomValidity('');
            }

            // Optional: Display validation message in UI
            const validationFeedback = document.getElementById('password-validation-feedback');
            if (validationFeedback) {
                validationFeedback.textContent = validationMessage;
                validationFeedback.style.color = errors.length > 0 ? 'red' : 'green';
            }
        });

        // Password match validation
        password2Input.addEventListener('input', function() {
            const password1 = password1Input.value;
            const password2 = this.value;

            if (password1 !== password2) {
                this.setCustomValidity("Passwords don't match");
            } else {
                this.setCustomValidity('');
            }
        });

        // Form submission
        signupForm.addEventListener('submit', handleSignup);
    });
}