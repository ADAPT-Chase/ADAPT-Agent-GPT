const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { User } = require('../config/database').models;
const logger = require('../config/logger');
const { sendEmail } = require('../config/emailService');
const CustomError = require('../utils/CustomError');

const validateUser = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400, 'VALIDATION_ERROR');
  }
  next();
};

router.post('/register', validateUser, handleValidationErrors, async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      throw new CustomError('User already exists', 400, 'USER_EXISTS');
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
    next(err);
  }
});

router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      throw new CustomError('Invalid verification token', 400, 'INVALID_TOKEN');
    }
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      throw new CustomError('Invalid Credentials', 400, 'INVALID_CREDENTIALS');
    }
    if (!user.isVerified) {
      throw new CustomError('Please verify your email before logging in', 400, 'EMAIL_NOT_VERIFIED');
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      throw new CustomError('Invalid Credentials', 400, 'INVALID_CREDENTIALS');
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'username', 'email', 'role', 'bio'] });
    if (!user) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/me', auth, async (req, res, next) => {
  try {
    const { username, email, bio } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Admin-only route to get all users
router.get('/all', [auth, adminAuth], async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'email', 'role', 'isVerified'] });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Admin-only route to change user role
router.put('/role/:userId', [auth, adminAuth], async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }
    user.role = user.role === 'user' ? 'admin' : 'user';
    await user.save();
    res.json({ message: 'User role updated', user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;