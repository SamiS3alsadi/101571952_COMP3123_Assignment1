const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

const FIELDS = ['first_name', 'last_name', 'email', 'position', 'salary', 'date_of_joining', 'department'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

// Every query includes { user: req.user.id }, so other users' records are never matched.
// For another user's record the result is 404 (not 403), so the API does not reveal that the ID exists.

exports.list = async (req, res) => {
  const employees = await Employee.find({ user: req.user.id }).sort({ created_at: -1 });
  logger.info('employees listed', { userId: req.user.id, count: employees.length });
  res.status(200).json({ success: true, count: employees.length, employees });
};

exports.create = async (req, res) => {
  const employee = await Employee.create({ ...pick(req.body), user: req.user.id });
  logger.info('employee created', { userId: req.user.id, employeeId: employee._id.toString() });
  res.status(201).json({ success: true, message: 'Employee created', employee });
};

exports.getOne = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.eid, user: req.user.id });
  if (!employee) {
    logger.warn('employee not found or not owned', { userId: req.user.id, employeeId: req.params.eid });
    throw new AppError(404, 'Employee not found');
  }
  res.status(200).json({ success: true, employee });
};

exports.update = async (req, res) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.eid, user: req.user.id },
    { $set: pick(req.body) },
    { new: true, runValidators: true }
  );
  if (!employee) {
    logger.warn('update rejected: employee not found or not owned', { userId: req.user.id, employeeId: req.params.eid });
    throw new AppError(404, 'Employee not found');
  }
  logger.info('employee updated', { userId: req.user.id, employeeId: req.params.eid });
  res.status(200).json({ success: true, message: 'Employee updated', employee });
};

exports.remove = async (req, res) => {
  const employee = await Employee.findOneAndDelete({ _id: req.query.eid, user: req.user.id });
  if (!employee) {
    logger.warn('delete rejected: employee not found or not owned', { userId: req.user.id, employeeId: req.query.eid });
    throw new AppError(404, 'Employee not found');
  }
  logger.info('employee deleted', { userId: req.user.id, employeeId: req.query.eid });
  res.status(204).end();
};
