const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const logger = require('../config/logger');
const { sendEmail } = require('../config/emailService');

const validateUser = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', validateUser, handleValidationErrors, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user = await User.create({ username, email, password, verificationToken });
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify your email',
      `Please verify your email by clicking on this link: ${verificationUrl}`,
      `<p>Please verify your email by clicking on this link: <a href="${verificationUrl}">${verificationUrl}</a></p>`
    );

    res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
  } catch (err) {
    logger.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    logger.error('Error verifying email:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', validateUser, handleValidationErrors, async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    logger.error('Error logging in user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'username', 'email', 'role'] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only route to get all users
router.get('/all', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'email', 'role', 'isVerified'] });
    res.json(users);
  } catch (err) {
    logger.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only route to change user role
router.put('/role/:userId', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = user.role === 'user' ? 'admin' : 'user';
    await user.save();
    res.json({ message: 'User role updated', user });
  } catch (err) {
    logger.error('Error updating user role:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;