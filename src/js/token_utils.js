import { getCookie, setCookie } from './cookie_utils';


// Function to decode JWT and get expiration
export function getJWTExpiration(token) {
    try {
        // Split the token and get the payload part (second part)
        const payload = JSON.parse(atob(token.split('.')[1]));
        // exp is in seconds, convert to milliseconds
        return new Date(payload.exp * 1000).toUTCString();
    } catch (error) {
        console.error('Error decoding JWT:', error);
        // Return a default expiration (e.g., 24 hours from now)
        return new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    }
}

export async function get_access_token() {
    try {
        // First try to get access token
        let accessToken = getCookie('access_token');
        
        // If access token exists, return it
        if (accessToken) {
            return accessToken;
        }

        // If no access token, try to get refresh token
        const refreshToken = getCookie('refresh_token');
        
        // If no refresh token either, return null
        if (!refreshToken) {
            return null;
        }

        // Use refresh token to get new access token
        const response = await fetch('http://localhost:8000/api/v1/auth/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        
        // Get expiration from JWT
        const expirationTime = getJWTExpiration(data.access)

        // Set new access token in cookie
        setCookie('access_token', data.access, expirationTime);
        
        return data.access;

    } catch (error) {
        console.error('Error in get_access_token:', error);
        return null;
    }
}

export function get_refresh_token() {
    try {
        const refresh_token = getCookie('refresh_token')
        if (refresh_token === "" || refresh_token === null) return null
        else return refresh_token
    } catch (error) {
        console.error('Error in get_refresh_token:', error);
        return null;
    }
}

export function clearTokens() {
    setCookie('access_token', '', 'Thu, 01 Jan 1970 00:00:00 GMT');
    setCookie('refresh_token', '', 'Thu, 01 Jan 1970 00:00:00 GMT');
}

export function clearUserProfile() {
    setCookie('user_profile', '', 'Thu, 01 Jan 1970 00:00:00 GMT');
}

export function logout(){
    clearTokens()
    clearUserProfile()
    window.location.href = '/signin.html';
}

export function isAuthenticated() {
    return get_refresh_token() !== null;
}

export function ensureAuthenticated(){
    if (isAuthenticated() == false) logout()
}

export async function refreshTokenIfNeeded() {
    const accessToken = getCookie('access_token');
    if (!accessToken || isTokenExpired(accessToken)) {
        return await get_access_token();
    }
    return accessToken;
}

export function logout_button_event(){
    document.getElementById('logout-button').addEventListener('click', ()=>{
        logout()
    })
}