const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const db = require('../config/database');
const User = db.User;
const logger = require('../config/logger');
const { sendEmail } = require('../config/emailService');
const CustomError = require('../utils/CustomError');

// ... rest of the file remains the same ...