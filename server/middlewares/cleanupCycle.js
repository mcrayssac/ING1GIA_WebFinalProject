require('dotenv').config();
const mongoose = require('mongoose');
const Machine = require('../models/Machines');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanupFinishedCycles() {
  const now = new Date();
  const machines = await Machine.find({ status: { $in: ['in-use', 'blocked'] } });

  for (const machine of machines) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const usageToday = machine.usageStats.find(stat => stat.day.getTime() === today.getTime());
    if (!usageToday) continue;

    const stillActiveUsers = [];
    const finishedUsers = [];

    for (const userId of machine.currentUsers) {
      const period = usageToday.usagePeriods.find(
        p => p.user.toString() === userId.toString()
      );

      if (period && period.endTime < now) {
        finishedUsers.push(userId);
        await User.findByIdAndUpdate(userId, { hasActiveCycle: false });
      } else {
        stillActiveUsers.push(userId);
      }
    }

    if (finishedUsers.length > 0) {
      await Machine.findByIdAndUpdate(machine._id, {
        currentUsers: stillActiveUsers,
        status: stillActiveUsers.length === 0 ? 'available' : 'in-use'
      });

      console.log(`[${new Date().toISOString()}] Machine ${machine.name} mise à jour`);
    }
  }

  console.log(`[${new Date().toISOString()}] Nettoyage des cycles terminé`);
}

setInterval(cleanupFinishedCycles, 1000);

process.on('SIGINT', async () => {
  console.log("\nArrêt du script de nettoyage...");
  await mongoose.disconnect();
  process.exit();
});
