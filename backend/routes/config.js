const express = require('express');
const router = express.Router();

/**
 * @desc    Get EmailJS Configuration
 * @route   GET /api/config/emailjs
 * @access  Public
 */
router.get('/emailjs', (req, res) => {
    res.json({
        serviceId: process.env.EMAILJS_SERVICE_ID,
        templateId: process.env.EMAILJS_TEMPLATE_ID,
        autoReplyTemplateId: process.env.EMAILJS_AUTO_REPLY_TEMPLATE_ID,
        publicKey: process.env.EMAILJS_PUBLIC_KEY
    });
});

module.exports = router;
