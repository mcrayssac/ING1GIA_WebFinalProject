const mongoose = require('mongoose');

// Schéma pour un relevé de capteur (sensor reading)
const sensorReadingSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  value: { type: Number, required: true },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_User,
    required: true
  }
}, { _id: false });

// Schéma pour une période d'utilisation (exemple : d'1h)
const usagePeriodSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: process.env.MONGO_Collection_User,
    required: true 
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
}, { _id: false });

// Statistiques journalières
const dailyUsageSchema = new mongoose.Schema({
  day: { 
    type: Date, 
    required: true, 
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  },
  sensorData: {
    type: Map,
    of: [ sensorReadingSchema ],
    default: {}
  },
  usagePeriods: { type: [ usagePeriodSchema ], default: [] }
}, { _id: false });

// Schéma principal de la machine
const machineSchema = new mongoose.Schema({
  mainPole: { type: String, required: true },
  subPole: { type: String, required: true },
  name: { type: String, required: true },
  pointsPerCycle: { type: Number, required: true },
  maxUsers: { type: Number, required: true },
  requiredGrade: { type: String, required: true },

  availableSensors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Sensor
  }],

  sites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Site
  }],

  sensorData: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_sensorData
  }],

  status: { 
    type: String, 
    enum: ['available', 'in-use', 'blocked'], 
    default: 'available' 
  },

  currentUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_User
  }],

  usageStats: { type: [ dailyUsageSchema ], default: [] },

  // ✅ Champ ajouté
  totalCycles: { type: Number, default: 0 }

}, { timestamps: true });

machineSchema.methods.addSensorReading = async function(designation, value, userId, timestamp = new Date()) {
  // Vérifie que les capteurs ont bien été peuplés avec .populate()
  if (!this.populated('availableSensors')) {
    throw new Error('availableSensors must be populated to add a sensor reading');
  }

  const validSensor = this.availableSensors.find(s => s.designation === designation);
  if (!validSensor) {
    throw new Error(`Sensor '${designation}' not found on this machine`);
  }

  const day = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
  let dailyRecord = this.usageStats.find(record => record.day.getTime() === day.getTime());

  if (!dailyRecord) {
    dailyRecord = { day, sensorData: new Map(), usagePeriods: [] };
    this.usageStats.push(dailyRecord);
    dailyRecord = this.usageStats[this.usageStats.length - 1];
  }

  if (!dailyRecord.sensorData.has(designation)) {
    dailyRecord.sensorData.set(designation, []);
  }

  const reading = { timestamp, value, user: userId };
  dailyRecord.sensorData.get(designation).push(reading);

  return this.save();
};

module.exports = mongoose.model('Machines', machineSchema, process.env.MONGO_Collection_Machine || 'Machines');
