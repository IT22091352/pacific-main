/**
 * Contact Form Handler using EmailJS
 * Fetches credentials securely from backend API
 */

(function () {
    document.addEventListener('DOMContentLoaded', async function () {
        const contactForm = document.getElementById('contactForm');
        const formMessage = document.getElementById('form-message');

        if (!contactForm) return;

        // Fetch EmailJS configuration from backend
        let emailConfig = null;
        try {
            // Determine API URL based on environment (local vs production)
            const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5000/api'
                : '/api';

            const response = await fetch(`${API_BASE}/config/emailjs`);
            if (!response.ok) throw new Error('Failed to load email configuration');

            emailConfig = await response.json();

            // Initialize EmailJS
            // Fallback to hardcoded key if backend fails (failsafe for Vercel propagation)
            const publicKey = (emailConfig && emailConfig.publicKey) ? emailConfig.publicKey : 'h7w-Q5zjUS-UTyves';

            if (publicKey) {
                emailjs.init(publicKey);
            } else {
                console.error('EmailJS Public Key not found in config');
            }

        } catch (error) {
            console.error('Error loading EmailJS config:', error);
            // Fallback error message if config fails to load
            if (formMessage) {
                formMessage.style.display = 'none'; // Don't show error immediately, only on submit
            }
        }

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            // Relaxed check: We now have fallbacks, so we only block if we truly can't proceed.
            // But since we hardcoded keys, we can almost always proceed.
            if (!emailConfig) {
                console.warn('Backend config failed, using local fallbacks.');
                emailConfig = {}; // Initialize empty object to avoid errors below
            }

            // Fallback to hardcoded values if config is missing (Vercel Failsafe)
            const serviceID = (emailConfig && emailConfig.serviceId) ? emailConfig.serviceId : 'service_wqsxhgt';
            const templateID = (emailConfig && emailConfig.templateId) ? emailConfig.templateId : 'template_w6ai859';
            const autoReplyTemplateID = (emailConfig && emailConfig.autoReplyTemplateId) ? emailConfig.autoReplyTemplateId : 'template_omemxha';

            // Get the submit button to show loading state
            const searchButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = searchButton.innerHTML;

            // Change button text to indicate loading
            searchButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';
            searchButton.disabled = true;

            // Hide previous messages
            formMessage.style.display = 'none';
            formMessage.className = 'alert';

            // Send the Admin Email first
            emailjs.sendForm(serviceID, templateID, this)
                .then(function (response) {
                    console.log('ADMIN EMAIL SUCCESS!', response.status, response.text);

                    // If Auto-Reply Template ID is configured and not a placeholder, send it too
                    if (autoReplyTemplateID && autoReplyTemplateID !== 'template_auto_reply_placeholder') {
                        // We use the same service, but the auto-reply template
                        // We reuse the form data (this) 
                        // Note: Ensure your Auto-Reply template also expects parameters like {{user_name}} etc.
                        return emailjs.sendForm(serviceID, autoReplyTemplateID, contactForm);
                    }
                    return Promise.resolve(); // Skip if no auto-reply configured
                })
                .then(function () {
                    console.log('AUTO-REPLY SENT (if configured)');

                    // Show success message
                    formMessage.className = 'alert alert-success';
                    formMessage.innerHTML = '<strong>Success!</strong> Your message has been sent to Wander Lanka Tours. We will get back to you soon.';
                    formMessage.style.display = 'block';

                    // Reset the form
                    contactForm.reset();
                })
                .catch(function (error) {
                    console.log('FAILED...', error);

                    // Show error message
                    formMessage.className = 'alert alert-danger';
                    formMessage.innerHTML = '<strong>Error!</strong> Failed to send message. Please check your internet connection or try again later.';
                    formMessage.style.display = 'block';
                })
                .finally(function () {
                    // Restore button state
                    searchButton.innerHTML = originalButtonText;
                    searchButton.disabled = false;

                    // Scroll to message
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
        });
    });
})();
