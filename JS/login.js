// ============================================
// login.js
//
// This file handles login and register page.
// It does:
//   1. Switch between Login/Register tabs
//   2. Validate form inputs before submitting
//   3. Send data to PHP backend using fetch()
//   4. Show success or error messages
// ============================================


// URL of your PHP backend files
var BACKEND_URL = 'http://localhost/shopnow/backend';


// ─────────────────────────────────────────
// FUNCTION: showTab
//
// Switches between Login and Register forms.
// tabName is either 'login' or 'register'
// ─────────────────────────────────────────
function showTab(tabName) {

  // Get both form elements from the page
  var loginForm    = document.getElementById('loginForm');
  var registerForm = document.getElementById('registerForm');

  // Get both tab buttons
  var loginTab    = document.getElementById('loginTab');
  var registerTab = document.getElementById('registerTab');

  // Get the switch text at the bottom of card
  var switchText = document.getElementById('switchText');

  if (tabName === 'login') {

    // Show login form
    loginForm.classList.remove('hidden');
    // Hide register form
    registerForm.classList.add('hidden');

    // Make login tab button look active
    loginTab.classList.add('active');
    registerTab.classList.remove('active');

    // Update bottom text
    switchText.innerHTML = "Don't have an account? <a href='#' onclick='showTab(\"register\")'>Register here</a>";

  } else {

    // Show register form
    registerForm.classList.remove('hidden');
    // Hide login form
    loginForm.classList.add('hidden');

    // Make register tab button look active
    registerTab.classList.add('active');
    loginTab.classList.remove('active');

    // Update bottom text
    switchText.innerHTML = "Already have an account? <a href='#' onclick='showTab(\"login\")'>Login here</a>";
  }

  // Clear all error messages when switching tabs
  clearAllErrors();
}


// ─────────────────────────────────────────
// FUNCTION: togglePassword
//
// Shows or hides the password text.
// inputId - which input to toggle
// btn     - the eye button that was clicked
// ─────────────────────────────────────────
function togglePassword(inputId, btn) {

  var input = document.getElementById(inputId);

  if (input.type === 'password') {
    input.type = 'text'; // show password as plain text
    btn.textContent = '🙈';
  } else {
    input.type = 'password'; // hide password again
    btn.textContent = '👁';
  }
}


// ─────────────────────────────────────────
// FUNCTION: handleLogin
//
// Runs when user clicks "Login" button.
// event.preventDefault() stops page refresh.
// ─────────────────────────────────────────
function handleLogin(event) {

  // Stop the form from refreshing the page
  // (default browser behavior for forms)
  event.preventDefault();

  // Clear old errors first
  clearAllErrors();

  // Get what user typed
  var email    = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;

  // Track if form is valid
  var isValid = true;

  // Check email
  if (email === '') {
    showFieldError('loginEmailError', 'loginEmail', 'Email is required.');
    isValid = false;
  } else if (isValidEmail(email) === false) {
    showFieldError('loginEmailError', 'loginEmail', 'Please enter a valid email.');
    isValid = false;
  }

  // Check password
  if (password === '') {
    showFieldError('loginPasswordError', 'loginPassword', 'Password is required.');
    isValid = false;
  }

  // If there are errors, stop here
  if (isValid === false) return;

  // Show loading on button
  var btn = document.querySelector('#loginForm .btn-submit');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  // ─────────────────────────────────────
  // Send data to PHP using fetch()
  //
  // fetch(url, options) sends an HTTP request
  //   method: 'POST' means we are sending data
  //   headers: tells server we are sending JSON
  //   body: the data we are sending (as JSON text)
  //
  // .then() runs when server responds
  // .catch() runs if server is unreachable
  // ─────────────────────────────────────
  fetch(BACKEND_URL + '/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  })

  .then(function(response) {
    // Convert response to JS object
    return response.json();
  })

  .then(function(data) {
    // data = what PHP sent back
    // e.g. { success: true, message: "Login successful!", user: {...} }

    btn.textContent = 'Login to Account';
    btn.disabled = false;

    if (data.success) {
      // Save user info to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));

      showFormMessage('loginMessage', '✅ ' + data.message + ' Redirecting...', 'success');

      // Go to profile page after 1.5 seconds
      setTimeout(function() {
        window.location.href = 'profile.html';
      }, 1500);

    } else {
      // Show error message from PHP
      showFormMessage('loginMessage', '❌ ' + data.message, 'error');
    }
  })

  .catch(function(error) {
    // This runs if XAMPP is off or URL is wrong
    btn.textContent = 'Login to Account';
    btn.disabled = false;
    showFormMessage('loginMessage', '❌ Cannot connect to server. Is XAMPP running?', 'error');
  });
}


// ─────────────────────────────────────────
// FUNCTION: handleRegister
//
// Runs when user clicks "Create Account"
// ─────────────────────────────────────────
function handleRegister(event) {

  event.preventDefault();
  clearAllErrors();

  // Get all field values
  var name            = document.getElementById('regName').value.trim();
  var email           = document.getElementById('regEmail').value.trim();
  var phone           = document.getElementById('regPhone').value.trim();
  var password        = document.getElementById('regPassword').value;
  var confirmPassword = document.getElementById('regConfirmPassword').value;
  var agreeTerms      = document.getElementById('agreeTerms').checked;

  var isValid = true;

  // Validate name
  if (name === '') {
    showFieldError('regNameError', 'regName', 'Full name is required.');
    isValid = false;
  }

  // Validate email
  if (email === '') {
    showFieldError('regEmailError', 'regEmail', 'Email is required.');
    isValid = false;
  } else if (isValidEmail(email) === false) {
    showFieldError('regEmailError', 'regEmail', 'Please enter a valid email.');
    isValid = false;
  }

  // Validate phone (optional, but must be 10 digits if entered)
  // /^[6-9]\d{9}$/ is a regex pattern for Indian mobile numbers
  if (phone !== '' && /^[6-9]\d{9}$/.test(phone) === false) {
    showFieldError('regPhoneError', 'regPhone', 'Enter valid 10-digit mobile number.');
    isValid = false;
  }

  // Validate password
  if (password === '') {
    showFieldError('regPasswordError', 'regPassword', 'Password is required.');
    isValid = false;
  } else if (password.length < 6) {
    showFieldError('regPasswordError', 'regPassword', 'Minimum 6 characters required.');
    isValid = false;
  }

  // Check passwords match
  if (confirmPassword === '') {
    showFieldError('regConfirmError', 'regConfirmPassword', 'Please confirm your password.');
    isValid = false;
  } else if (password !== confirmPassword) {
    showFieldError('regConfirmError', 'regConfirmPassword', 'Passwords do not match.');
    isValid = false;
  }

  // Check terms checkbox
  if (agreeTerms === false) {
    showFormMessage('registerMessage', 'Please agree to the Terms & Conditions.', 'error');
    isValid = false;
  }

  if (isValid === false) return;

  // Show loading
  var btn = document.querySelector('#registerForm .btn-submit');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  // Send data to PHP
  fetch(BACKEND_URL + '/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:     name,
      email:    email,
      phone:    phone,
      password: password
    })
  })

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {

    btn.textContent = 'Create Account';
    btn.disabled = false;

    if (data.success) {
      showFormMessage('registerMessage', '✅ ' + data.message, 'success');
      // Switch to login tab after 1.5 seconds
      setTimeout(function() {
        showTab('login');
      }, 1500);
    } else {
      showFormMessage('registerMessage', '❌ ' + data.message, 'error');
    }
  })

  .catch(function(error) {
    btn.textContent = 'Create Account';
    btn.disabled = false;
    showFormMessage('registerMessage', '❌ Cannot connect. Is XAMPP running?', 'error');
  });
}


// ─────────────────────────────────────────
// HELPER FUNCTIONS
// Small functions used by the above code
// ─────────────────────────────────────────

// Check if email format is correct
// The /pattern/ is a regex (pattern matching tool)
// It checks that email has something@something.something
function isValidEmail(email) {
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email); // returns true or false
}

// Show red error message under a specific input
function showFieldError(errorId, inputId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.add('error'); // adds red border
}

// Show a message box below the form (green or red)
function showFormMessage(messageId, text, type) {
  var el = document.getElementById(messageId);
  el.textContent = text;
  el.className = 'form-message ' + type;
  // type is 'success' or 'error'
  // CSS uses these classes to color it green or red
}

// Remove all error messages and red borders
function clearAllErrors() {

  // Clear all error text spans
  var errorSpans = document.querySelectorAll('.field-error');
  errorSpans.forEach(function(span) {
    span.textContent = '';
  });

  // Remove red/green border from all inputs
  var inputs = document.querySelectorAll('.auth-form input');
  inputs.forEach(function(input) {
    input.classList.remove('error');
    input.classList.remove('success');
  });

  // Clear form messages
  var messages = document.querySelectorAll('.form-message');
  messages.forEach(function(msg) {
    msg.textContent = '';
    msg.className = 'form-message';
  });
}
