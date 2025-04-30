// scripts/cycleDataGenerator.js
require('dotenv').config();
const mongoose = require('mongoose');
const Machine = require('../models/Machines');
const User = require('../models/User');
const Sensor = require('../models/Sensors');


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Génère une valeur aléatoire pour simuler un capteur
function randomValue(min = 10, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateSensorData() {
  const now = new Date();

  const machines = await Machine.find({ status: { $in: ['in-use', 'blocked'] } })
    .populate('availableSensors'); // ← essentiel pour obtenir designation

  for (const machine of machines) {
    const activeUsers = machine.currentUsers;
    if (!activeUsers || activeUsers.length === 0) continue;

    for (const userId of activeUsers) {
      for (const sensor of machine.availableSensors) {

        if (!sensor || !sensor.designation) {
          console.warn(`⚠️ Capteur invalide ou non peuplé sur machine ${machine.name}`);
          continue;
        }

        try {
          await machine.addSensorReading(sensor.designation, randomValue(), userId, now);
        } catch (err) {
          console.error(`Erreur capteur ${sensor.designation} sur machine ${machine.name}:`, err.message);
        }
      }
    }
  }

  console.log(`[${new Date().toISOString()}] ➤ Données de capteurs simulées pour machines actives.`);
}

setInterval(simulateSensorData, 1000);

// Arrêt propre
process.on('SIGINT', async () => {
  console.log("\nArrêt du simulateur de capteurs...");
  await mongoose.disconnect();
  process.exit();
});
