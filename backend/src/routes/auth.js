const express = require('express');
const router  = express.Router();
const { register, login, verifyOTP, resendOTP, getMe, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register',     register);
router.post('/login',        login);
router.post('/verify-otp',   verifyOTP);
router.post('/resend-otp',   resendOTP);
router.get('/me',            verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
