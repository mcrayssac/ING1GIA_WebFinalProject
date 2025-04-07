const mongoose = require('mongoose');

// Schéma pour un relevé de capteur individuel
const sensorReadingSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  value: { type: Number, required: true }
}, { _id: false });

// Schéma pour une période d'utilisation (ici, par exemple, d'1h)
const usagePeriodSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: process.env.MONGO_Collection_User,
    required: true 
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
}, { _id: false });

// Schéma pour les statistiques d'utilisation d'une journée
const dailyUsageSchema = new mongoose.Schema({
  // La date du jour, tronquée à minuit
  day: { 
    type: Date, 
    required: true, 
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  },
  // Un Map où la clé est le nom du capteur et la valeur est un tableau de relevés
  sensorData: {
    type: Map,
    of: [ sensorReadingSchema ],
    default: {}
  },
  // Périodes d'utilisation durant la journée
  usagePeriods: { type: [ usagePeriodSchema ], default: [] }
}, { _id: false });

// Schéma principal de la machine
const machineSchema = new mongoose.Schema({
  // Pôle et Sous-pôle d'affectation de la machine
  mainPole: { type: String, required: true },         // Ex: "Bas de la fusée", "Structure", "Haut de la fusée"
  subPole: { type: String, required: true },           // Ex: "Moteur", "Injection carburant"
  
  // Informations générales sur la machine
  name: { type: String, required: true },              // Ex: "Fraiseuse CNC Haute Précision"
  pointsPerCycle: { type: Number, required: true },
  maxUsers: { type: Number, required: true },
  requiredGrade: { type: String, required: true },
  
  // Capteurs disponibles avec accès conditionnel selon le grade
  availableSensors: [{
    sensorName: { type: String, required: true },      // Ex: "Température", "Vibration"
    requiredGrade: { type: String, required: true }      // Ex: "Technicien confirmé", "Ingénieur"
  }],
  
  // Référence aux sites où la machine est physiquement installée
  sites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Site
  }],

  // Statistiques d'utilisation, organisées par jour
  usageStats: { type: [ dailyUsageSchema ], default: [] }
}, {
  timestamps: true
});

/**
 * Méthode pour ajouter un relevé de capteur à la journée en cours.
 * Vérifie que le capteur existe dans availableSensors avant d'ajouter le relevé.
 *
 * @param {String} sensorName - Nom du capteur.
 * @param {Number} value - La valeur mesurée.
 * @param {Date} [timestamp=new Date()] - L'heure du relevé.
 * @returns {Promise} - Promesse résolue après sauvegarde.
 */
machineSchema.methods.addSensorReading = async function(sensorName, value, timestamp = new Date()) {
  // Vérifier que le capteur est déclaré dans la machine
  const sensorExists = this.availableSensors.some(s => s.sensorName === sensorName);
  if (!sensorExists) {
    throw new Error(`Sensor '${sensorName}' does not exist on this machine.`);
  }

  // Calculer la date du jour tronquée à minuit
  const day = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

  // Chercher un enregistrement pour ce jour
  let dailyRecord = this.usageStats.find(record => {
    return record.day.getTime() === day.getTime();
  });

  // Si aucun enregistrement pour aujourd'hui n'existe, en créer un nouveau
  if (!dailyRecord) {
    dailyRecord = { day, sensorData: new Map(), usagePeriods: [] };
    this.usageStats.push(dailyRecord);
    dailyRecord = this.usageStats[this.usageStats.length - 1];
  }

  // Vérifier si la clé du capteur existe déjà dans sensorData, sinon l'initialiser avec un tableau vide
  if (!dailyRecord.sensorData.has(sensorName)) {
    dailyRecord.sensorData.set(sensorName, []);
  }

  // Créer le relevé
  const reading = { timestamp, value };

  // Ajouter le relevé au tableau correspondant au capteur
  dailyRecord.sensorData.get(sensorName).push(reading);

  return this.save();
};

module.exports = mongoose.model(process.env.MONGO_Collection_Machine, machineSchema);
