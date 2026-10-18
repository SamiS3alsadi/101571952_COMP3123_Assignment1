const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const employeeValidator = require('../validators/employeeValidator');
const employeeController = require('../controllers/employeeController');

// All employee routes require a valid JWT.
router.use(auth);

router.get('/employees', employeeController.list);
router.post('/employees', employeeValidator.create, validate, employeeController.create);
router.get('/employees/:eid', employeeValidator.eidParam, validate, employeeController.getOne);
router.put('/employees/:eid', employeeValidator.eidParam, employeeValidator.update, validate, employeeController.update);
router.delete('/employees', employeeValidator.eidQuery, validate, employeeController.remove);

module.exports = router;
