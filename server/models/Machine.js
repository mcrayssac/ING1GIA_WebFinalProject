const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  // Pôle et Sous-pôle d'affectation de la machine
  mainPole: { type: String, required: true },         // Ex: "Bas de la fusée", "Structure", "Haut de la fusée", etc. (à voir pour créer des "codes")
  subPole: { type: String, required: true },           // Ex: "Moteur", "Injection carburant", etc. (à voir pour créer des "codes")
  
  // Informations générales sur la machine
  name: { type: String, required: true },              // Nom de la machine, ex: "Fraiseuse CNC Haute Précision"
  pointsPerCycle: { type: Number, required: true },    // Points attribués par cycle d'utilisation
  maxUsers: { type: Number, required: true },          // Nombre maximum d'utilisateurs simultanés
  requiredGrade: { type: String, required: true },     // Grade requis pour utiliser la machine, ex: "Technicien et Apprenti", "Ingénieur confirmé"
  //Capteurs disponibles  
  availableSensors: [{          
    sensorName: { type: String, required: true },   // Par exemple : "Température", "Vibration"
    requiredGrade: { type: String, required: true } // Par exemple : "Technicien confirmé", "Ingénieur", etc.
  }],
  // Référence aux sites où la machine est physiquement installée
  // Un employé pourra utiliser cette machine s'il appartient à l'un des sites référencés
  sites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: process.env.MONGO_Collection_Site // Doit correspondre au modèle de la collection des sites
  }],

  // Statistiques d'utilisation qui permettront de générer des simulations/graphes
  // Chaque enregistrement correspond à un cycle d'utilisation, incluant les données issues des capteurs
  usageStats: [
    {
      cycleDate: { type: Date, default: Date.now },
      sensorData: { type: mongoose.Schema.Types.Mixed } // Structure flexible pour stocker les mesures des capteurs
    }
  ]
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

module.exports = mongoose.model(process.env.MONGO_Collection_Machine, machineSchema);
