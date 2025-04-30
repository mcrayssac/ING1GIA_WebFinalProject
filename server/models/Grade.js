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

module.exports= mongoose.model('Grade',gradeSchema,process.env.MONGO_Collection_Grade || 'Grade');
