import re

# List of files to update
files_to_update = [
    'c:/Users/ASUS/Downloads/pacific-main/pacific-main/destinations.html',
    'c:/Users/ASUS/Downloads/pacific-main/pacific-main/packages.html',
    'c:/Users/ASUS/Downloads/pacific-main/pacific-main/gallery.html',
    'c:/Users/ASUS/Downloads/pacific-main/pacific-main/contact.html'
]

# Old login modal pattern (to be replaced)
old_login_pattern = r'''    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Login to Wander Lanka Tours</h2>
                <button class="close-modal" onclick="closeModal\('loginModal'\)">&times;</button>
            </div>
            <div class="modal-body">
                <div id="loginError" class="error-message"></div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email Address</label>
                        <input type="email" id="loginEmail" name="email" required placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" name="password" required
                            placeholder="Enter your password">
                    </div>
                    <button type="submit" class="btn-auth">Login</button>
                </form>
            </div>
            <div class="modal-footer">
                <p>Don't have an account? <a onclick="switchToSignup\(\)">Sign up here</a></p>
            </div>
        </div>
    </div>'''

# New login modal with forgot password
new_login_modal = '''    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h2>Welcome Back</h2>
                    <p>Login to Wander Lanka Tours to continue your journey</p>
                </div>
                <button class="close-modal" onclick="closeModal('loginModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div id="loginError" class="error-message"></div>
                <form id="loginForm">
                    <div class="input-group">
                        <span class="fa fa-envelope input-icon"></span>
                        <input type="email" id="loginEmail" name="email" required placeholder=" ">
                        <label for="loginEmail">Email Address</label>
                    </div>
                    <div class="input-group">
                        <span class="fa fa-lock input-icon"></span>
                        <input type="password" id="loginPassword" name="password" required placeholder=" ">
                        <label for="loginPassword">Password</label>
                        <span class="fa fa-eye toggle-password" onclick="togglePassword('loginPassword', this)"></span>
                    </div>

                    <div class="extra-links">
                        <a href="#" onclick="switchToForgot(event)" class="forgot-link">Forgot Password?</a>
                    </div>

                    <button type="submit" class="btn-auth">
                        <span>Login to Account</span>
                    </button>
                </form>

                <div class="divider">OR</div>

                <div class="modal-footer" style="background: none; border: none; padding: 0;">
                    <p>Don't have an account? <a onclick="switchToSignup()">Sign up here</a></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Forgot Password Modal -->
    <div id="forgotModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h2>Reset Password</h2>
                    <p>We'll help you get back comfortably</p>
                </div>
                <button class="close-modal" onclick="closeModal('forgotModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div id="forgotError" class="error-message"></div>
                <div id="forgotSuccess" class="success-message"></div>
                <p style="margin-bottom: 25px; color: #666; font-size: 0.95rem; text-align: center;">Do not worry! Enter
                    your email address associated with your account and we will send you a link to reset your password.
                </p>
                <form id="forgotForm">
                    <div class="input-group">
                        <span class="fa fa-envelope input-icon"></span>
                        <input type="email" id="forgotEmail" name="email" required placeholder=" ">
                        <label for="forgotEmail">Email Address</label>
                    </div>
                    <button type="submit" class="btn-auth">Send Reset Link</button>
                </form>
            </div>
            <div class="modal-footer">
                <p>Remembered it? <a onclick="switchToLogin()">Login here</a></p>
            </div>
        </div>
    </div>'''

# Old signup modal pattern
old_signup_pattern = r'''    <!-- Signup Modal -->
    <div id="signupModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create Account</h2>
                <button class="close-modal" onclick="closeModal\('signupModal'\)">&times;</button>
            </div>
            <div class="modal-body">
                <div id="signupError" class="error-message"></div>
                <form id="signupForm">
                    <div class="form-group">
                        <label for="signupName">Full Name</label>
                        <input type="text" id="signupName" name="name" required placeholder="Enter your full name">
                    </div>
                    <div class="form-group">
                        <label for="signupEmail">Email Address</label>
                        <input type="email" id="signupEmail" name="email" required placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="signupPassword">Password</label>
                        <input type="password" id="signupPassword" name="password" required
                            placeholder="At least 6 characters">
                    </div>
                    <div class="form-group">
                        <label for="signupConfirmPassword">Confirm Password</label>
                        <input type="password" id="signupConfirmPassword" name="confirmPassword" required
                            placeholder="Re-enter your password">
                    </div>
                    <button type="submit" class="btn-auth">Create Account</button>
                </form>
            </div>
            <div class="modal-footer">
                <p>Already have an account? <a onclick="switchToLogin\(\)">Login here</a></p>
            </div>
        </div>
    </div>'''

# New signup modal
new_signup_modal = '''    <!-- Signup Modal -->
    <div id="signupModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h2>Create Account</h2>
                    <p>Join us for exclusive experiences</p>
                </div>
                <button class="close-modal" onclick="closeModal('signupModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div id="signupError" class="error-message"></div>
                <form id="signupForm">
                    <div class="input-group">
                        <span class="fa fa-user input-icon"></span>
                        <input type="text" id="signupName" name="name" required placeholder=" ">
                        <label for="signupName">Full Name</label>
                    </div>
                    <div class="input-group">
                        <span class="fa fa-envelope input-icon"></span>
                        <input type="email" id="signupEmail" name="email" required placeholder=" ">
                        <label for="signupEmail">Email Address</label>
                    </div>
                    <div class="input-group">
                        <span class="fa fa-lock input-icon"></span>
                        <input type="password" id="signupPassword" name="password" required placeholder=" ">
                        <label for="signupPassword">Password</label>
                        <span class="fa fa-eye toggle-password" onclick="togglePassword('signupPassword', this)"></span>
                    </div>
                    <div class="input-group">
                        <span class="fa fa-lock input-icon"></span>
                        <input type="password" id="signupConfirmPassword" name="confirmPassword" required
                            placeholder=" ">
                        <label for="signupConfirmPassword">Confirm Password</label>
                    </div>
                    <button type="submit" class="btn-auth">Create Account</button>
                </form>

                <div class="divider">OR</div>

                <div class="modal-footer" style="background: none; border: none; padding: 0;">
                    <p>Already have an account? <a onclick="switchToLogin()">Login here</a></p>
                </div>
            </div>
        </div>
    </div>'''

# Process each file
for file_path in files_to_update:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace login modal
        content = re.sub(old_login_pattern, new_login_modal, content, flags=re.DOTALL)
        
        # Replace signup modal
        content = re.sub(old_signup_pattern, new_signup_modal, content, flags=re.DOTALL)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated: {file_path}")
    except Exception as e:
        print(f"✗ Error updating {file_path}: {e}")

print("\nAll files updated successfully!")
