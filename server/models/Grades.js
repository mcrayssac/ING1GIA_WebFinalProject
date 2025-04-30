const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model(
  process.env.MONGO_Collection_Grade || 'Grades',
  gradeSchema
);
