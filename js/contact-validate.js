document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // simple validation
            let isValid = true;
            const errors = [];

            const nameInput = contactForm.querySelector('input[placeholder="Your Name *"]');
            const emailInput = contactForm.querySelector('input[placeholder="Your Email *"]');
            const messageInput = contactForm.querySelector('textarea');

            // clear previous styles
            [nameInput, emailInput, messageInput].forEach(input => {
                if (input) input.style.borderColor = '';
            });

            if (nameInput && !nameInput.value.trim()) {
                isValid = false;
                nameInput.style.borderColor = 'red';
                errors.push('Name is required');
            }

            if (emailInput && !validateEmail(emailInput.value)) {
                isValid = false;
                emailInput.style.borderColor = 'red';
                errors.push('Valid email is required');
            }

            if (messageInput && !messageInput.value.trim()) {
                isValid = false;
                messageInput.style.borderColor = 'red';
                errors.push('Message is required');
            }

            if (!isValid) {
                // Show error (visual feedback already applied to borders)
                // Optionally shake form or show toast
                alert('Please correct the errors: \n' + errors.join('\n'));
            } else {
                // Mock submission
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';

                setTimeout(() => {
                    alert('Message sent successfully! We will get back to you soon.');
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 1500);
            }
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
});
