// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    if (!token && !currentPage.includes('login') && !currentPage.includes('signup')) {
        window.location.href = '/login';
    } else if (token && (currentPage.includes('login') || currentPage.includes('signup'))) {
        window.location.href = '/dashboard';
    }
}

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();
    
    const errorDiv = document.getElementById('authError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        errorDiv.style.display = 'none';
        
        const result = await api.signup(formData);
        
        if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = '/dashboard';
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Signup failed. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const errorDiv = document.getElementById('authError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const credentials = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        errorDiv.style.display = 'none';
        
        const result = await api.login(credentials);
        
        if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = '/dashboard';
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);