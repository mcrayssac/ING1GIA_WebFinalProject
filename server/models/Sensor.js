const mongoose = require('mongoose');

// Schéma pour un relevé de capteur individuel
const sensorReadingSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  value:     { type: Number, required: true },
  user:      { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: process.env.MONGO_Collection_User,
    required: true
  }
}, { _id: false });

// Schéma principal du capteur
const sensorSchema = new mongoose.Schema({
  // Référence à la machine
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Machine,
    required: true
  },
  // Nom et grade requis pour accéder aux lectures de ce capteur
  name:          { type: String, required: true },
  requiredGrade: { type: String, required: true },
  // Toutes les lectures générées
  readings:      { type: [sensorReadingSchema], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model(process.env.MONGO_Collection_Sensor, sensorSchema);
