const mongoose = require('mongoose');



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
  // Un Map où la clé est le nom du capteur et la valeur est un tableau de relevés (chaque relevé contient le timestamp, la valeur et l'ID de l'utilisateur)
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
  mainPole: { type: String, required: true },
  subPole: { type: String, required: true },
  
  // Informations générales sur la machine
  name: { type: String, required: true },
  pointsPerCycle: { type: Number, required: true },
  maxUsers: { type: Number, required: true },
  requiredGrade: { type: String, required: true },
  
  // Capteurs disponibles avec accès conditionnel selon le grade
  availableSensors: [{type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Sensor}],
  
  // Référence aux sites où la machine est physiquement installée
  sites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Site
  }],
  sensorData: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_sensorData
  }],
  //gestion en temps réel
  status: { 
    type: String, 
    enum: ['available', 'in-use', 'blocked'], 
    default: 'available' 
  },
  currentUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_User
  }],

  // Statistiques d'utilisation, organisées par jour
  usageStats: { type: [ dailyUsageSchema ], default: [] }
}, {
  timestamps: true
});

/**
 * Méthode pour ajouter un relevé de capteur à la journée en cours.
 * Cette méthode vérifie que le capteur existe dans availableSensors et y ajoute le relevé
 * en incluant l'ID de l'utilisateur qui l'envoie.
 *
 * @param {String} designation - Nom du capteur.
 * @param {Number} value - La valeur mesurée.
 * @param {String} userId - L'ID de l'utilisateur qui envoie la lecture.
 * @param {Date} [timestamp=new Date()] - L'heure du relevé.
 * @returns {Promise} - Promesse résolue après sauvegarde.
 */
machineSchema.methods.addSensorReading = async function(designation, value, userId, timestamp = new Date()) {
  // Vérifier que le capteur est déclaré dans la machine
  const sensorExists = this.availableSensors.some(s => s.designation === designation);
  if (!sensorExists) {
    throw new Error(`Sensor '${designation}' does not exist on this machine.`);
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
  if (!dailyRecord.sensorData.has(designation)) {
    dailyRecord.sensorData.set(designation, []);
  }

  // Créer le relevé en incluant l'ID de l'utilisateur
  const reading = { timestamp, value, user: userId };

  // Ajouter le relevé au tableau correspondant au capteur
  dailyRecord.sensorData.get(designation).push(reading);

  return this.save();
};

// if (!process.env.MONGO_Collection_Machine || typeof process.env.MONGO_Collection_Machine !== 'string') {
//   throw new Error('Environment variable MONGO_Collection_Machine must be a valid string.');
// }

// export default mongoose.model('Machines', machineSchema,process.env.MONGO_Collection_Machine || 'Machines');
module.exports = mongoose.model('Machines', machineSchema, process.env.MONGO_Collection_Machine || 'Machines');