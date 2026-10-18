const { body } = require('express-validator');

const signup = [
  body('username')
    .exists({ values: 'falsy' }).withMessage('username is required')
    .bail()
    .isString().trim()
    .isLength({ min: 3, max: 30 }).withMessage('username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('username may contain only letters, numbers and underscores'),
  body('email')
    .exists({ values: 'falsy' }).withMessage('email is required')
    .bail()
    .isString().trim()
    .isEmail().withMessage('email must be a valid email address')
    .isLength({ max: 254 }).withMessage('email is too long'),
  body('password')
    .exists({ values: 'falsy' }).withMessage('password is required')
    .bail()
    .isString()
    .isLength({ min: 8, max: 72 }).withMessage('password must be 8-72 characters')
    .matches(/[A-Za-z]/).withMessage('password must contain a letter')
    .matches(/[0-9]/).withMessage('password must contain a number'),
];

const login = [
  body('username').optional().isString().trim().notEmpty().withMessage('username cannot be empty'),
  body('email').optional().isString().trim().isEmail().withMessage('email must be a valid email address'),
  body('password').exists({ values: 'falsy' }).withMessage('password is required').bail().isString(),
  body().custom((value) => {
    if (!value.username && !value.email) throw new Error('username or email is required');
    return true;
  }),
];

module.exports = { signup, login };
