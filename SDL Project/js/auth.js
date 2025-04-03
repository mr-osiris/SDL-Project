/**
 * auth.js - User authentication functionality for Lost & Found Tracker
 */

document.addEventListener('DOMContentLoaded', function() {
    // Update UI based on authentication state
    updateAuthUI();
    
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Handle password reset form submission
    const resetForm = document.getElementById('resetPasswordForm');
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePasswordReset();
        });
    }
    
    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

/**
 * Check if user is logged in
 * @returns {boolean} - Whether user is logged in
 */
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

/**
 * Get authenticated user data
 * @returns {Object|null} - User data or null if not logged in
 */
function getAuthUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Update UI elements based on authentication state
 */
function updateAuthUI() {
    const loginNavItem = document.getElementById('loginNavItem');
    const registerNavItem = document.getElementById('registerNavItem');
    const logoutNavItem = document.getElementById('logoutNavItem');
    const profileNavItem = document.getElementById('profileNavItem');
    
    if (isLoggedIn()) {
        // User is logged in
        if (loginNavItem) loginNavItem.style.display = 'none';
        if (registerNavItem) registerNavItem.style.display = 'none';
        if (logoutNavItem) logoutNavItem.style.display = 'block';
        if (profileNavItem) profileNavItem.style.display = 'block';
        
        // Update user-specific elements
        const userData = getAuthUser();
        if (userData) {
            const userDisplayElements = document.querySelectorAll('.user-display-name');
            userDisplayElements.forEach(el => {
                el.textContent = userData.username;
            });
        }
        
        // Check for restricted pages
        const loginPrompt = document.getElementById('loginPrompt');
        const restrictedContent = document.getElementById('restrictedContent');
        
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (restrictedContent) restrictedContent.style.display = 'block';
        
        // Enable report form if on report page
        const reportForm = document.getElementById('reportForm');
        if (reportForm) reportForm.style.display = 'block';
    } else {
        // User is not logged in
        if (loginNavItem) loginNavItem.style.display = 'block';
        if (registerNavItem) registerNavItem.style.display = 'block';
        if (logoutNavItem) logoutNavItem.style.display = 'none';
        if (profileNavItem) profileNavItem.style.display = 'none';
        
        // Hide restricted content
        const loginPrompt = document.getElementById('loginPrompt');
        const restrictedContent = document.getElementById('restrictedContent');
        const reportForm = document.getElementById('reportForm');
        
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (restrictedContent) restrictedContent.style.display = 'none';
        if (reportForm) reportForm.style.display = 'none';
    }
}

/**
 * Handle login form submission
 */
function handleLogin() {
    const emailOrUsername = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate input
    if (!emailOrUsername || !password) {
        showFormError('loginError', 'Please enter all required fields.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    
    // Clear any previous errors
    hideFormError('loginError');
    
    // Send login request to server
    const loginData = {
        emailOrUsername: emailOrUsername,
        password: password,
        rememberMe: rememberMe
    };
    
    fetch('api/auth/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showFormError('loginError', data.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
        
        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Log the login action
        logUserActivity('login', 'User logged in');
        
        // Redirect to appropriate page
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = redirectUrl;
    })
    .catch(error => {
        console.error('Login error:', error);
        showFormError('loginError', 'An error occurred during login. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    });
}

/**
 * Handle registration form submission
 */
function handleRegistration() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate input
    if (!username || !email || !password || !confirmPassword) {
        showFormError('registerError', 'Please enter all required fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showFormError('registerError', 'Passwords do not match.');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        showFormError('registerError', 'Password must be at least 8 characters long.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
    
    // Clear any previous errors
    hideFormError('registerError');
    
    // Send registration request to server
    const registrationData = {
        username: username,
        email: email,
        password: password
    };
    
    fetch('api/auth/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showFormError('registerError', data.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
        
        // Show success message
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('registerSuccess').style.display = 'block';
        
        // Automatically log in the user if verification is not required
        if (data.autoLogin) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Redirect after a delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        showFormError('registerError', 'An error occurred during registration. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    });
}

/**
 * Handle password reset request
 */
function handlePasswordReset() {
    const email = document.getElementById('resetEmail').value;
    
    // Validate input
    if (!email) {
        showFormError('resetError', 'Please enter your email address.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#resetPasswordForm button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    
    // Clear any previous errors
    hideFormError('resetError');
    
    // Send password reset request to server
    fetch('api/auth/reset-password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showFormError('resetError', data.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
        
        // Show success message
        document.getElementById('resetPasswordForm').style.display = 'none';
        document.getElementById('resetSuccess').style.display = 'block';
    })
    .catch(error => {
        console.error('Password reset error:', error);
        showFormError('resetError', 'An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    });
}

/**
 * Log the user out
 */
function logout() {
    // Get auth token before clearing
    const token = localStorage.getItem('authToken');
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Notify server about logout
    if (token) {
        fetch('api/auth/logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).catch(error => {
            console.error('Logout notification error:', error);
        });
    }
    
    // Redirect to home page
    window.location.href = 'index.html';
}

/**
 * Show form error message
 * @param {string} elementId - ID of error element
 * @param {string} message - Error message to display
 */
function showFormError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Hide form error message
 * @param {string} elementId - ID of error element
 */
function hideFormError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/**
 * Log user activity
 * @param {string} actionType - Type of action
 * @param {string} description - Description of action
 */
function logUserActivity(actionType, description) {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    const activityData = {
        actionType: actionType,
        description: description
    };
    
    fetch('api/users/log-activity.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
    }).catch(error => {
        console.error('Activity logging error:', error);
    });
}

/**
 * Check authorization for protected resources
 * Redirects to login page if not authenticated
 */
function checkAuth() {
    if (!isLoggedIn()) {
        const currentPage = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${currentPage}`;
        return false;
    }
    return true;
}