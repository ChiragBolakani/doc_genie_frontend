import { getCookie } from "./cookie_utils";

// Function to get and parse user profile from cookie
export function getUserProfile() {
    try {
        const userProfileCookie = getCookie('user_profile');
        if (userProfileCookie) {
            return JSON.parse(userProfileCookie);
        }
        return null;
    } catch (error) {
        console.error('Error parsing user profile:', error);
        return null;
    }
}

// Function to update header with user information
export function updateHeaderUserInfo() {
    const userProfile = getUserProfile();
    if (userProfile) {
        // Get the name display element
        const nameElement = document.querySelector('.text-sm.font-medium.text-black.dark\\:text-white');
        
        // Get the role/email display element
        const roleElement = nameElement?.nextElementSibling;

        if (nameElement && roleElement) {
            // Set the name (use email if name is not available)
            const displayName = userProfile.first_name && userProfile.last_name 
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : userProfile.email;
            
            nameElement.textContent = displayName;
            
            // Set the email as secondary text
            roleElement.textContent = userProfile.email;
        }
    }
}