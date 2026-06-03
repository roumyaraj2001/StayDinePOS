// Auth page functionality
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabBtns = document.querySelectorAll('.tab-btn');

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Update active tab
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update active form
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });
    
    if (tabName === 'login') {
      loginForm.classList.add('active');
    } else {
      signupForm.classList.add('active');
    }
  });
});

// Login handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const phone = '+91' + document.getElementById('loginPhone').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!phone || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showNotification('Login successful!', 'success');
      
      // Redirect based on role
      setTimeout(() => {
        redirectUserByRole(data.user.role);
      }, 1000);
    } else {
      showNotification(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showNotification('Network error. Please try again.', 'error');
    console.error('Login error:', error);
  }
});

// Signup handler
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = '+91' + document.getElementById('signupPhone').value.trim();
  const role = document.getElementById('signupRole').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  if (!name || !email || !phone || !role || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, password, role }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification('Account created successfully! Logging you in...', 'success');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setTimeout(() => {
        redirectUserByRole(data.user.role);
      }, 1500);
    } else {
      showNotification(data.error || 'Signup failed', 'error');
    }
  } catch (error) {
    showNotification('Network error. Please try again.', 'error');
    console.error('Signup error:', error);
  }
});

// Google OAuth handler (placeholder)
document.querySelector('.btn-google').addEventListener('click', (e) => {
  e.preventDefault();
  showNotification('Google OAuth integration required', 'warning');
  // In production, implement Google OAuth here
});

// Utility functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '2000';
  notification.style.maxWidth = '400px';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

function redirectUserByRole(role) {
  const redirectMap = {
    'restaurant_owner': '/pages/admin-dashboard.html',
    'admin': '/pages/admin-dashboard.html',
    'manager': '/pages/dashboard.html',
    'staff': '/pages/dashboard.html',
    'cashier': '/pages/billing.html',
    'kitchen_staff': '/pages/kitchen.html',
    'customer': '/pages/customer-menu.html',
  };
  
  const redirectUrl = redirectMap[role] || '/pages/dashboard.html';
  window.location.href = redirectUrl;
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    redirectUserByRole(user.role);
  }
});
