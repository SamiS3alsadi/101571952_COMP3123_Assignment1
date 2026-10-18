const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    last_name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    email: { type: String, required: true, trim: true, lowercase: true },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    salary: { type: Number, required: true, min: [0.01, 'salary must be positive'] },
    date_of_joining: { type: Date, required: true },
    department: { type: String, required: true, trim: true, maxlength: 100 },
    // Owner of this record. Indexed because every query filters by it.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Employee', employeeSchema);
