const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  designation: { type: String, required: true },
  requiredGrade: { type: String, required: true },
  CreatedAt: { type: Date, required: true, default: Date.now },
  supplier: { type: String, required: false }
});
 
module.exports = mongoose.model('Sensors', sensorSchema, process.env.MONGO_Collection_Sensor || 'Sensors');