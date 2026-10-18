const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

const SALT_ROUNDS = 12;

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
  if (exists) {
    logger.warn('signup rejected: duplicate user');
    throw new AppError(409, 'Username or email already exists');
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email: email.toLowerCase(), password: hashed });
  logger.info('user registered', { userId: user._id.toString() });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: { id: user._id, username: user.username, email: user.email },
  });
};

exports.login = async (req, res) => {
  const { username, email, password } = req.body;
  const filter = username ? { username } : { email: email.toLowerCase() };

  const user = await User.findOne(filter).select('+password');
  const valid = user && (await bcrypt.compare(password, user.password));

  if (!valid) {
    // Same message for unknown user and wrong password so attackers cannot enumerate accounts.
    logger.warn('login failed: invalid credentials');
    throw new AppError(401, 'Invalid credentials');
  }

  const token = jwt.sign({ sub: user._id.toString(), username: user.username }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
  logger.info('login successful', { userId: user._id.toString() });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
};
