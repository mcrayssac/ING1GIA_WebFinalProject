const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Apprentice', 'Technician', 'Engineer', 'Manager'],
    required: true,
    unique: true
  },
  cap: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  }
});

const Grade = mongoose.model(process.env.MONGO_Collection_Grade, gradeSchema);

module.exports = Grade;
