const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getUserProfile, getReferralStats } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { otpValidation } = require('../middleware/validator');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', otpValidation, verifyOtp);
router.get('/profile', protect, getUserProfile);
router.get('/referrals', protect, getReferralStats);

module.exports = router;
