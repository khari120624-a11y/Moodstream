import { dbUser as User } from '../utils/dbManager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmailOTP, sendPasswordResetEmail } from '../utils/otpSender.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mood_music_super_secret_key_12345', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user (generates OTP)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Create user (unverified by default)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      otpCode: otp,
      otpExpires,
    });

    if (user) {
      // Dispatch real email verification code
      sendEmailOTP(email, otp);

      // Print OTP in a prominent terminal log box for development
      console.log('\n┌──────────────────────────────────────────────┐');
      console.log(`│   [OTP SERVICE] Verification Code: ${otp}    │`);
      console.log(`│   Sent to: ${email}                           │`);
      console.log('└──────────────────────────────────────────────┘\n');

      res.status(201).json({
        verified: false,
        tempUserId: user.id,
        message: 'OTP sent to email. Please verify.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: `Server error: ${error.message}`, error: error.stack });
  }
};

/**
 * @desc    Verify OTP and activate account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  const { tempUserId, otpCode } = req.body;

  try {
    if (!tempUserId || !otpCode) {
      return res.status(400).json({ message: 'Missing user ID or OTP code' });
    }

    const user = await User.findById(tempUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Check expiration
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.otpCode !== otpCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Activate user
    user.isVerified = true;
    user.otpCode = '';
    await user.save();

    res.status(200).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      isVerified: true,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('OTP Verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

/**
 * @desc    Resend OTP code
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  const { tempUserId } = req.body;

  try {
    if (!tempUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(tempUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    // Dispatch real email verification code
    sendEmailOTP(user.email, otp);

    // Print OTP in terminal
    console.log('\n┌──────────────────────────────────────────────┐');
    console.log(`│   [OTP SERVICE] New Verification Code: ${otp}│`);
    console.log(`│   Sent to: ${user.email}                           │`);
    console.log('└──────────────────────────────────────────────┘\n');

    res.status(200).json({ message: 'New verification code has been sent' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error resending verification code' });
  }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // If user exists but is not verified, generate and resend OTP
      if (!user.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        // Dispatch real email verification code
        sendEmailOTP(user.email, otp);

        console.log('\n┌──────────────────────────────────────────────┐');
        console.log(`│   [OTP SERVICE] Verification Code: ${otp}    │`);
        console.log(`│   Sent to: ${user.email}                           │`);
        console.log('└──────────────────────────────────────────────┘\n');

        return res.status(401).json({
          verified: false,
          tempUserId: user.id,
          message: 'Your account is unverified. An OTP has been sent to complete registration.',
        });
      }

      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        isVerified: true,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Request password reset OTP code
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email' });
    }

    // Generate 6-digit OTP code for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtpCode = otp;
    user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    await user.save();

    // Send the email containing the OTP code
    sendPasswordResetEmail(email, otp);

    // Print OTP in a prominent terminal log box for development
    console.log('\n┌──────────────────────────────────────────────┐');
    console.log(`│   [OTP SERVICE] Password Reset Code: ${otp}   │`);
    console.log(`│   Sent to: ${email}                           │`);
    console.log('└──────────────────────────────────────────────┘\n');

    res.status(200).json({ message: 'Password reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * @desc    Verify reset OTP and set new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  const { email, otpCode, newPassword } = req.body;

  try {
    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists and matches
    if (!user.resetOtpCode || user.resetOtpCode !== otpCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check code expiration
    if (new Date() > user.resetOtpExpires) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset OTP fields
    user.password = hashedPassword;
    user.resetOtpCode = '';
    user.resetOtpExpires = null;
    
    // Also mark as verified in case user resets their password (which validates ownership of the email)
    user.isVerified = true;
    
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
