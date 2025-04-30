const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true }
});

module.exports = mongoose.model(
  process.env.MONGO_Collection_Employee || 'Employees',
  employeeSchema
);
