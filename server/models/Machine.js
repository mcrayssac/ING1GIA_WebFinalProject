const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  mainPole:       { type: String, required: true },
  subPole:        { type: String, required: true },
  name:           { type: String, required: true },
  pointsPerCycle: { type: Number, required: true },
  maxUsers:       { type: Number, required: true },
  requiredGrade:  { type: String, required: true },

  // Liste des capteurs (ObjectId vers la collection Sensor)
  availableSensors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Sensor
  }],

  // Gestion des accès simultanés
  status: {
    type: String,
    enum: ['available', 'in-use', 'blocked'],
    default: 'available'
  },
  currentUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_User
  }],

  // Statistique simple : nombre total de cycles démarrés
  totalCycles: { type: Number, default: 0 }
}, {
  timestamps: true
});

/**
 * Démarre un cycle d'utilisation (1h)
 * - Vérifie la capacité
 * - Ajoute l'utilisateur à currentUsers
 * - Incrémente totalCycles
 * - Met à jour le statut
 */
machineSchema.methods.startCycle = async function(userId) {
  if (this.currentUsers.length >= this.maxUsers) {
    throw new Error('Machine at full capacity');
  }

  this.currentUsers.push(userId);
  this.totalCycles += 1; 
  // Si tous les postes sont pris, passe à "in-use"
  this.status = this.currentUsers.length === this.maxUsers
    ? 'in-use'
    : 'available';
  return this.save();
};

module.exports = mongoose.model(process.env.MONGO_Collection_Machine, machineSchema);
