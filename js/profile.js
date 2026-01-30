document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Authentication (Redirect if not logged in)
    // 1. Check Authentication (Redirect if not logged in)
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Populate User Data
    const sidebarName = document.getElementById('sidebarName');
    const sidebarEmail = document.getElementById('sidebarEmail');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');

    // Get data from localStorage
    const userName = localStorage.getItem('userName') || "Guest User";
    const userEmail = localStorage.getItem('userEmail') || "user@example.com";

    if (sidebarName) sidebarName.textContent = userName;
    if (sidebarEmail) sidebarEmail.textContent = userEmail;
    if (profileName) profileName.value = userName;
    if (profileEmail) profileEmail.value = userEmail;

    // 3. Edit Toggle Logic
    const editToggle = document.getElementById('editToggle');
    const saveActions = document.getElementById('saveActions');
    const cancelEdit = document.getElementById('cancelEdit');
    const inputs = document.querySelectorAll('#profileForm input:not(#profileEmail)'); // Email usually read-only

    if (editToggle) {
        editToggle.addEventListener('click', () => {
            inputs.forEach(input => input.disabled = false);
            saveActions.style.display = 'flex';
            editToggle.style.display = 'none';
        });
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
            inputs.forEach(input => input.disabled = true);
            saveActions.style.display = 'none';
            editToggle.style.display = 'inline-block';
            // Reset values
            if (profileName) profileName.value = userName;
        });
    }

    // 4. Save Changes (Mock)
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newName = document.getElementById('profileName').value;
            // Get email although we might not update it yet, but good practice if extended
            const email = document.getElementById('profileEmail').value;

            try {
                const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                    ? 'http://localhost:5000/api'
                    : '/api';

                const response = await fetch(`${API_URL}/auth/updatedetails`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: newName,
                        email: email
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Update Local Storage
                    localStorage.setItem('userName', data.data.name);
                    localStorage.setItem('userEmail', data.data.email);

                    // Update UI
                    sidebarName.textContent = data.data.name;
                    sidebarEmail.textContent = data.data.email;

                    // Update Navbar Welcome Text if present (optional immediate feedback)
                    const welcomeStrong = document.querySelector('.welcome-text strong');
                    if (welcomeStrong) welcomeStrong.textContent = data.data.name;

                    // Re-disable form
                    inputs.forEach(input => input.disabled = true);
                    saveActions.style.display = 'none';
                    editToggle.style.display = 'inline-block';

                    alert('Profile updated successfully!');
                } else {
                    alert(data.message || 'Update failed');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Something went wrong. Please try again.');
            }
        });
    }
});
