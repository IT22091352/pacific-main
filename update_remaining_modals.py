import re

# Files to update
files = [
    'c:/Users/ASUS/Downloads/pacific-main/pacific-main/destinations.html',
    'c:/Users/ASUS/Downloads/pacific-main/pacific-main/packages.html',
    'c:/Users/ASUS/Downloads/pacific-main/pacific-main/gallery.html'
]

# Read the updated modals from index.html
with open('c:/Users/ASUS/Downloads/pacific-main/pacific-main/index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Extract the login modal section (including forgot password modal)
login_start = index_content.find('    <!-- Login Modal -->')
forgot_end = index_content.find('    <!-- Signup Modal -->')
new_login_section = index_content[login_start:forgot_end].strip()

# Extract the signup modal section
signup_start = forgot_end
signup_end = index_content.find('    <!-- Authentication Script -->')
new_signup_section = index_content[signup_start:signup_end].strip()

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and replace login modal section
        old_login_start = content.find('    <!-- Login Modal -->')
        old_signup_start = content.find('    <!-- Signup Modal -->')
        
        if old_login_start != -1 and old_signup_start != -1:
            # Replace login section (up to signup modal)
            before_login = content[:old_login_start]
            after_signup_start = content[old_signup_start:]
            
            # Find end of signup modal
            signup_end_marker = after_signup_start.find('    </div>\n\n    <div id="ftco-loader"')
            if signup_end_marker == -1:
                signup_end_marker = after_signup_start.find('    </div>\r\n\r\n    <div id="ftco-loader"')
            if signup_end_marker == -1:
                signup_end_marker = after_signup_start.find('    </div>\n\n    <script')
            if signup_end_marker == -1:
                signup_end_marker = after_signup_start.find('    </div>\r\n\r\n    <script')
            
            if signup_end_marker != -1:
                after_signup = after_signup_start[signup_end_marker + 11:]  # +11 for '    </div>\n\n'
                
                # Reconstruct the file
                new_content = before_login + new_login_section + '\n\n    ' + new_signup_section + '\n\n    ' + after_signup
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✓ Updated: {file_path}")
            else:
                print(f"✗ Could not find signup end marker in: {file_path}")
        else:
            print(f"✗ Could not find modals in: {file_path}")
    except Exception as e:
        print(f"✗ Error updating {file_path}: {e}")

print("\nDone!")
