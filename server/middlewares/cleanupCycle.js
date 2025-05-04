require('dotenv').config();
const mongoose = require('mongoose');
const Machine = require('../models/Machine');
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
      const periods = usageToday.usagePeriods
        .filter(p => p.user.toString() === userId.toString())
        .sort((a, b) => b.endTime - a.endTime); // plus récent d'abord
    
      const lastPeriod = periods[0];
    
      if (lastPeriod && lastPeriod.endTime < now) {
        console.log(`✅ Terminé pour ${userId} (fin : ${lastPeriod.endTime.toISOString()})`);
        finishedUsers.push(userId);
        await User.findByIdAndUpdate(userId, { hasActiveCycle: false });
      } else {
        console.log(`🕒 Toujours actif : ${userId}`);
        stillActiveUsers.push(userId);
      }
    }
      
    if (finishedUsers.length > 0) {
      machine.currentUsers = stillActiveUsers;
      machine.status = stillActiveUsers.length === 0 ? 'available' : 'in-use';
      await machine.save();
  
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
