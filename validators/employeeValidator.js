const { body, param, query } = require('express-validator');

const ALLOWED = ['first_name', 'last_name', 'email', 'position', 'salary', 'date_of_joining', 'department'];

// Reject unexpected fields. "user" is deliberately not allowed: the owner is taken from the JWT only.
const noUnknownFields = body().custom((value) => {
  const extra = Object.keys(value || {}).filter((k) => !ALLOWED.includes(k));
  if (extra.length) throw new Error(`Unexpected fields: ${extra.join(', ')}`);
  return true;
});

const fieldRules = (required) => {
  const chain = (field) => (required ? body(field).exists({ values: 'falsy' }).withMessage(`${field} is required`).bail() : body(field).optional().bail());
  return [
    chain('first_name').isString().trim().isLength({ min: 1, max: 50 }).withMessage('first_name must be 1-50 characters'),
    chain('last_name').isString().trim().isLength({ min: 1, max: 50 }).withMessage('last_name must be 1-50 characters'),
    chain('email').isString().trim().isEmail().withMessage('email must be a valid email address').isLength({ max: 254 }),
    chain('position').isString().trim().isLength({ min: 1, max: 100 }).withMessage('position must be 1-100 characters'),
    chain('salary').isFloat({ gt: 0 }).withMessage('salary must be a positive number').toFloat(),
    chain('date_of_joining').isISO8601().withMessage('date_of_joining must be a valid date (ISO 8601)').toDate(),
    chain('department').isString().trim().isLength({ min: 1, max: 100 }).withMessage('department must be 1-100 characters'),
  ];
};

const create = [...fieldRules(true), noUnknownFields];

const update = [
  ...fieldRules(false),
  noUnknownFields,
  body().custom((value) => {
    if (!Object.keys(value || {}).length) throw new Error('Request body must contain at least one field to update');
    return true;
  }),
];

const eidParam = [param('eid').isMongoId().withMessage('eid must be a valid employee ID')];
const eidQuery = [query('eid').exists({ values: 'falsy' }).withMessage('eid query parameter is required').bail().isMongoId().withMessage('eid must be a valid employee ID')];

module.exports = { create, update, eidParam, eidQuery };
