const express = require('express');
const {
    register,
    login,
    getMe,
    logout,
    updateDetails,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
