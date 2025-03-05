// Utility function to convert ISO date string to UTC string
export function convertToUTCString(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date string');
        }
        return date.toUTCString();
    } catch (error) {
        console.error('Error converting date:', error);
        // Return a default expiration of 1 day if date conversion fails
        const defaultDate = new Date();
        defaultDate.setTime(defaultDate.getTime() + (24 * 60 * 60 * 1000));
        return defaultDate.toUTCString();
    }
}

// Simple setCookie function that expects proper UTC string for expiration
export function setCookie(name, value, expirationUTCString = null) {
    let cookieString = `${name}=${value};path=/`;
    
    if (expirationUTCString) {
        cookieString += `;expires=${expirationUTCString}`;
    }
    
    document.cookie = cookieString;
}

// Function to get a cookie
export function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

// Function to delete a cookie
export function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Function to check if a cookie exists
export function checkCookie(name) {
    const cookie = getCookie(name);
    return cookie !== "";
}
