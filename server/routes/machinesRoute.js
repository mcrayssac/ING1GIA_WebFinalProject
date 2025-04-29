// server/models/Machine.js
const mongoose = require('mongoose');

// Pour stocker un relevé de capteur
const sensorReadingSchema = new mongoose.Schema({
  timestamp:  { type: Date,   default: Date.now },
  value:      { type: Number, required: true },
  user:       { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: process.env.MONGO_Collection_User 
  }
}, { _id: false });

// Période de travail d’1h sur la machine
const usagePeriodSchema = new mongoose.Schema({
  user:      { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: process.env.MONGO_Collection_User,
    required: true 
  },
  startTime: { type: Date, required: true },
  endTime:   { type: Date, required: true }
}, { _id: false });

// Statistiques journalières (agrégation par jour)
const dailyUsageSchema = new mongoose.Schema({
  day: {
    type: Date,
    required: true,
    default() {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  },
  // Map capteur → tableau de readings
  sensorData: {
    type: Map,
    of: [sensorReadingSchema],
    default: {}
  },
  // Périodes d’utilisation dans la journée
  usagePeriods: {
    type: [usagePeriodSchema],
    default: []
  }
}, { _id: false });

const machineSchema = new mongoose.Schema({
  mainPole:       { type: String, required: true },
  subPole:        { type: String, required: true },
  name:           { type: String, required: true },
  pointsPerCycle: { type: Number, required: true },
  maxUsers:       { type: Number, required: true },
  requiredGrade:  { type: String, required: true },

  // Liste des capteurs embarqués et grade requis pour y accéder
  availableSensors: [{
    sensorName:    { type: String, required: true },
    requiredGrade: { type: String, required: true }
  }],

  // Affectation multi-site
  sites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Site
  }],

  // État courant
  status: {
    type: String,
    enum: ['available', 'in-use', 'blocked'],
    default: 'available'
  },
  currentUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_User
  }],

  // Historique agrégé par jour
  usageStats: {
    type: [dailyUsageSchema],
    default: []
  }
}, {
  timestamps: true
});

/**
 * Ajoute un relevé de capteur sur la journée en cours.
 */
machineSchema.methods.addSensorReading = async function(sensorName, value, timestamp = new Date(), userId) {
  // Vérification capteur existant
  if (!this.availableSensors.some(s => s.sensorName === sensorName)) {
    throw new Error(`Capteur "${sensorName}" non déclaré sur cette machine`);
  }

  // Jour tronqué
  const day = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

  // Recherche ou création du record journalier
  let daily = this.usageStats.find(r => r.day.getTime() === day.getTime());
  if (!daily) {
    daily = { day, sensorData: new Map(), usagePeriods: [] };
    this.usageStats.push(daily);
    daily = this.usageStats[this.usageStats.length - 1];
  }

  // Initialisation du tableau si besoin
  if (!daily.sensorData.has(sensorName)) {
    daily.sensorData.set(sensorName, []);
  }

  // Pousser le relevé
  daily.sensorData.get(sensorName).push({ timestamp, value, user: userId });
  return this.save();
};

module.exports = mongoose.model(process.env.MONGO_Collection_Machine, machineSchema);
