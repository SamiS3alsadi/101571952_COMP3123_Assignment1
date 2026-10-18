const router = require('express').Router();
const { authLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const userValidator = require('../validators/userValidator');
const userController = require('../controllers/userController');

// Express 5 forwards async errors to the error handler automatically.
router.post('/signup', authLimiter, userValidator.signup, validate, userController.signup);
router.post('/login', authLimiter, userValidator.login, validate, userController.login);

module.exports = router;
