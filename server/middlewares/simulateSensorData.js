const mongoose = require('mongoose');
const Machine = require('./models/Machine');  // Adapte le chemin selon ton projet

// Connection mongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spacey';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB for simulation'))
  .catch(err => console.error('MongoDB connection error:', err));

// ID de la machine à simuler (à adapter selon ta base ou les machines créées)
const machineId = '624b1f45f1d2c0a5f1e8b9d2'; // Remplace par une ID valide

// Fonction de simulation qui génère des données aléatoires
const simulateSensorData = async () => {
  try {
    const machine = await Machine.findById(machineId);
    if (!machine) {
      console.error('Machine not found');
      return;
    }
    
    // Par exemple, simuler une lecture pour le capteur "Température"
    const sensorName = "Température";
    // Génère une valeur aléatoire entre -30 et 50°C (pour un exemple)
    const value = Math.floor(Math.random() * 80 - 30);
    
    await machine.addSensorReading(sensorName, value);
    console.log(`Added fake ${sensorName} reading: ${value} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error simulating sensor data:', error.message);
  }
};

// Lancer la simulation toutes les 5 minutes (5 * 60 * 1000 ms)
setInterval(simulateSensorData, 5 * 60 * 1000);

// Pour lancer une première exécution immédiatement
simulateSensorData();
