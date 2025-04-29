const mongoose = require('mongoose');

const sensorDataSchema= new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  value: { type: Number, required: true },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: process.env.MONGO_Collection_User,
    required: true 
  }
});

module.exports = mongoose.model('sensorData', sensorSchema, process.env.MONGO_Collection_sensorData || 'sensorData');