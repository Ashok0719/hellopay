const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Mock OTP storage (In production, use Redis or a dedicated OTP service)
const otpStore = new Map();

// @desc    Send OTP to mobile
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Generate 4-digit OTP
  const otp = "1234"; // Fixed for demo, use Math.floor(1000 + Math.random() * 9000).toString() for real
  otpStore.set(phone, otp);

  // In a real app, send SMS via Twilio/Firebase here
  console.log(`[AUTH] OTP for ${phone}: ${otp}`);

  res.status(200).json({ message: 'OTP sent successfully', mockOtp: otp });
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { phone, otp, name, referralCode } = req.body;

  const storedOtp = otpStore.get(phone);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Clear OTP after use
  otpStore.delete(phone);

  let user = await User.findOne({ phone });

  if (!user) {
    // If user doesn't exist, Register
    if (!name) {
      return res.status(400).json({ message: 'Name is required for new registration' });
    }

    // Create unique referral code
    let newReferralCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }

    user = await User.create({
      name,
      phone,
      isOtpVerified: true,
      referralCode: newReferralCode,
      referredBy,
    });
  } else {
    // If user exists, just update verification status
    user.isOtpVerified = true;
    await user.save();
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been banned temporarily' });
  }

  res.status(200).json({
    _id: user._id,
    userIdNumber: user.userIdNumber,
    name: user.name,
    phone: user.phone,
    isSeller: user.isSeller,
    verifiedUpiId: user.verifiedUpiId,
    walletBalance: user.walletBalance,
    referralCode: user.referralCode,
    token: generateToken(user._id),
  });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      userIdNumber: user.userIdNumber,
      name: user.name,
      phone: user.phone,
      isSeller: user.isSeller,
      verifiedUpiId: user.verifiedUpiId,
      walletBalance: user.walletBalance,
      referralCode: user.referralCode,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Get referral statistics
// @route   GET /api/auth/referrals
// @access  Private
const getReferralStats = async (req, res) => {
  const referrals = await User.find({ referredBy: req.user._id }, 'name createdAt');
  res.json({
    totalReferrals: referrals.length,
    referralList: referrals,
    referralEarnings: referrals.length * 50, 
  });
};

module.exports = { sendOtp, verifyOtp, getUserProfile, getReferralStats };
