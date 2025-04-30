require('dotenv').config();
const mongoose = require('mongoose');
const Machine = require('../models/Machines');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Cette fonction vérifie et nettoie les utilisateurs dont le cycle est terminé
async function cleanupFinishedCycles() {
  const now = new Date();
  const machines = await Machine.find({ status: { $in: ['in-use', 'blocked'] } });

  for (const machine of machines) {
    let hasChanges = false;
    const stillActiveUsers = [];

    for (const userId of machine.currentUsers) {
      // Recherche les périodes d'utilisation de ce user aujourd'hui
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const usage = machine.usageStats.find(stat => stat.day.getTime() === today.getTime());

      const period = usage?.usagePeriods.find(
        p => p.user.toString() === userId.toString()
      );

      if (period && period.endTime < now) {
        // Le cycle est terminé => on retire le user de la machine
        await User.findByIdAndUpdate(userId, { hasActiveCycle: false });
        hasChanges = true;
      } else {
        stillActiveUsers.push(userId);
      }
    }

    if (hasChanges) {
      machine.currentUsers = stillActiveUsers;
      machine.status = stillActiveUsers.length === 0 ? 'available' : 'in-use';
      await machine.save();
      console.log(`[${new Date().toISOString()}] Machine ${machine.name} mise à jour`);
    }
  }
  console.log(`[${new Date().toISOString()}] Nettoyage des cycles terminé`);
}

setInterval(cleanupFinishedCycles, 500); // Verifier toutes les 0.5 secondes

// Arrêt propre
process.on('SIGINT', async () => {
  console.log("\nArrêt du script de nettoyage...");
  await mongoose.disconnect();
  process.exit();
});
