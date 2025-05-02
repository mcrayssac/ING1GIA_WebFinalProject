const express = require("express");
const router = express.Router();
const Machine = require("../models/Machines");
const User = require("../models/User");

// ---------------------------------------------------------------------------
// GET /api/machines
// Query-params éventuels :
//   • search         → filtre "name contains" (insensible à la casse)
//   • status         → 'available' | 'in-use' | 'blocked'
//   • requiredGrade  → string exact (ex. 'Technician')
// ---------------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const { search, status, requiredGrade } = req.query;

    const filter = {};
    if (search)        filter.name          = { $regex: search, $options: "i" };
    if (status)        filter.status        = status;
    if (requiredGrade) filter.requiredGrade = requiredGrade;

    const machines = await Machine.find(filter);
    // (Pas de .populate ici puisque ton front récupère sensors/sites à part)

    res.json(machines);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/machines/:id
// Renvoie la fiche machine complète
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id)
      // On peuple les capteurs et les sites pour avoir leurs infos si besoin.
      // La page front ne garde que les _id, mais si un jour tu veux afficher
      // les noms directement, c’est déjà prêt.
      .populate("availableSensors")
      .populate("sites");

    if (!machine)
      return res.status(404).json({ error: "Machine not found" });

    res.json(machine);
  } catch (err) {
    next(err);
  }
});


// Route : lancer un cycle sur une machine
router.post("/:id/start-cycle", async (req, res) => {
  const userId = "68147b03df5b3fd0e59b63c0"; // user de test (codé en dur)
  const machineId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.hasActiveCycle)
      return res.status(400).json({ error: "User already in active cycle" });

    const machine = await Machine.findById(machineId).populate("availableSensors");
    if (!machine) return res.status(404).json({ error: "Machine not found" });

    if (machine.currentUsers.length >= machine.maxUsers)
      return res.status(400).json({ error: "Machine has reached max users" });

    // 1. Marquer l'utilisateur comme actif
    user.hasActiveCycle = true;
    user.points += machine.pointsPerCycle;
    await user.save();

    // 2. Ajouter le user à la machine
    machine.currentUsers.push(user._id);

    // 3. Déterminer le nouveau statut
    if (machine.currentUsers.length >= machine.maxUsers) {
      machine.status = "blocked";
    } else {
      machine.status = "in-use";
    }

    // 4. Ajouter une période d'utilisation
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000); // +1h

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let usageEntry = machine.usageStats.find(
      (entry) => entry.day.getTime() === today.getTime()
    );

    if (!usageEntry) {
      usageEntry = { day: today, sensorData: {}, usagePeriods: [] };
      machine.usageStats.push(usageEntry);
    }

    usageEntry.usagePeriods.push({
      user: user._id,
      startTime: now,
      endTime: end,
    });

    await machine.save();

    // Note : génération de données fictives via script séparé ou cron
    // Vous pouvez appeler ici un script ou enregistrer un événement à traiter via queue ou worker

    return res.status(200).json({
      success: true,
      message: "Cycle démarré avec succès",
      pointsAdded: machine.pointsPerCycle,
      cycleEndsAt: end,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/machines/:id/sensors/:sensorId
// Renvoie la machine + le capteur demandé + stats complètes
// ---------------------------------------------------------------------------
router.get("/:id/:sensorId", async (req, res, next) => {
  try {
    const { id: machineId, sensorId } = req.params;

    // 1) Machine avec capteurs peuplés
    const machine = await Machine.findById(machineId)
      .populate("availableSensors");
    if (!machine)
      return res.status(404).json({ error: "Machine not found" });

    // 2) Capteur présent sur la machine ?
    const sensor = machine.availableSensors.find(
      (s) => s._id.toString() === sensorId
    );
    if (!sensor)
      return res
        .status(404)
        .json({ error: "Sensor not found on this machine" });

    // 3) Réponse
    res.json({
      machineId,
      sensor,
      usageStats: machine.usageStats,   // le front filtrera la journée voulue
      totalCycles: machine.totalCycles,
      status: machine.status,
      maxUsers: machine.maxUsers,
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;