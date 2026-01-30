// Ceylon Sang - Authentication JavaScript
// API Base URL
// Determine API URL based on environment
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

// DOM Elements
let loginModal, signupModal, loginForm, signupForm, authButton, userNameDisplay;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initAuth();
    checkAuthStatus();
});

// Initialize authentication
function initAuth() {
    // Get DOM elements
    loginModal = document.getElementById('loginModal');
    signupModal = document.getElementById('signupModal');
    loginForm = document.getElementById('loginForm');
    signupForm = document.getElementById('signupForm');
    authButton = document.getElementById('authButton');
    userNameDisplay = document.getElementById('userNameDisplay');

    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');

    if (token && userName) {
        updateUIForLoggedInUser(userName);
    } else {
        updateUIForLoggedOutUser();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.id);

            // Update UI
            updateUIForLoggedInUser(data.user.name);

            // Close modal
            closeModal('loginModal');

            // Show success message
            showMessage('Login successful! Welcome back, ' + data.user.name, 'success');

            // Reset form
            loginForm.reset();
        } else {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
        console.error('Login error:', error);
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const errorDiv = document.getElementById('signupError');

    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }

    // Validate password length
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.id);

            // Update UI
            updateUIForLoggedInUser(data.user.name);

            // Close modal
            closeModal('signupModal');

            // Show success message
            showMessage('Account created successfully! Welcome, ' + data.user.name, 'success');

            // Reset form
            signupForm.reset();
        } else {
            errorDiv.textContent = data.message || 'Signup failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
        console.error('Signup error:', error);
    }
}

// Handle logout
function handleLogout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');

    // Update UI
    updateUIForLoggedOutUser();

    // Show message
    showMessage('Logged out successfully', 'success');
}

// Update UI for logged in user
function updateUIForLoggedInUser(userName) {
    if (authButton) {
        // Desktop Navbar: Minimal Icons Only
        authButton.innerHTML = `
            <div class="user-profile-minimal">
                <a href="#" class="login-link" title="Profile (Coming Soon)">
                    <span class="fa fa-user-circle-o" style="font-size: 1.2rem;"></span>
                </a>
                <a onclick="handleLogout()" class="logout-link ml-3" title="Logout">
                    <span class="fa fa-sign-out" style="font-size: 1.2rem;"></span>
                </a>
            </div>
        `;
    }

    // Inject into Mobile Menu
    addMobileUserInfo(userName);
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    if (authButton) {
        authButton.innerHTML = `
            <a onclick="openModal('loginModal')" class="login-link">
                <span class="fa fa-user-circle-o mr-1"></span> Login
            </a>
        `;
    }

    // Remove Mobile User Info if exists
    removeMobileUserInfo();
}

// Helper: Add User Info to Mobile Menu
function addMobileUserInfo(userName) {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // Check if already exists
        let userInfo = document.querySelector('.mobile-user-info-item');
        if (!userInfo) {
            userInfo = document.createElement('li');
            userInfo.className = 'mobile-user-info-item';

            // Insert at the TOP
            navLinks.insertBefore(userInfo, navLinks.firstChild);
        }

        userInfo.innerHTML = `
            <div class="mobile-user-info">
                <span class="fa fa-user-circle mobile-user-icon"></span>
                <div class="mobile-user-details">
                    <span class="greeting">Welcome back,</span>
                    <span class="username">${userName}</span>
                </div>
            </div>
        `;
    }
}

// Helper: Remove User Info from Mobile Menu
function removeMobileUserInfo() {
    const userInfo = document.querySelector('.mobile-user-info-item');
    if (userInfo) {
        userInfo.remove();
    }
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear error messages
        const errorDiv = modal.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }
    }
}

// Switch between login and signup
function switchToSignup() {
    closeModal('loginModal');
    openModal('signupModal');
}

function switchToLogin() {
    closeModal('signupModal');
    openModal('loginModal');
}

// Show message
function showMessage(message, type = 'success') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} auth-message`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Get auth token for API requests
function getAuthToken() {
    return localStorage.getItem('token');
}

// Make authenticated API request
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    return fetch(url, { ...options, headers });
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};
