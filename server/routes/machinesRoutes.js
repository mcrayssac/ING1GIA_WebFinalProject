// routes/machines.js - Consolidated machine routes
const express = require("express");
const router = express.Router();
const Machine = require("../models/Machine");
const User = require("../models/User");
const authmiddleware = require("../middlewares/authMiddlewares");
const {verifyToken} = require("../middlewares/authMiddlewares");

// Get all machines with filters
router.get("/", async (req, res) => {
  try {
    const { status, requiredGrade, search } = req.query;
    let query = {};

    if (status && status !== "all") query.status = status;
    if (requiredGrade && requiredGrade !== "all") query.requiredGrade = requiredGrade;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mainPole: { $regex: search, $options: "i" } },
        { subPole: { $regex: search, $options: "i" } }
      ];
    }

    const machines = await Machine.find(query);
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a machine by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMachine = await Machine.findByIdAndDelete(id);
    if (!deletedMachine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    res.json({ message: "Machine deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a machine by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMachine = await Machine.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedMachine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    res.json(updatedMachine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST to add a new machine
router.post("/", async (req, res) => {
  try {
    const newMachine = new Machine(req.body);
    await newMachine.save();
    res.status(201).json(newMachine);
  } catch (err) {
    res.status(500).json({ error: "Failed to add machine" });
  }
});

// Get a machine by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findById(id);
    if (!machine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    res.json(machine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route : lancer un cycle sur une machine
router.post("/:id/start-cycle",verifyToken, async (req, res) => {
  const userId = req.user._id; // Récupérer l'ID de l'utilisateur à partir du token JWT
  const hasActiveCycle = req.user.hasActiveCycle; // Vérifier si l'utilisateur a déjà un cycle actif
  if (!userId) return res.status(401).json({ error: "User not authenticated" });
  const machineId = req.params.id;
  console.log("Machine ID:", machineId);
  console.log("User ID:", userId);
  try {
    const user = await User.findById(userId);
    if (!userId) return res.status(404).json({ error: "User not found" });
    if (hasActiveCycle)
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
    const end = new Date(now.getTime() + 10 * 60 * 1000); // +10 minutes de cycle

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let usageEntry = machine.usageStats.find(
      (entry) => entry.day.getTime() === today.getTime()
    );

    if (!usageEntry) {
      usageEntry = {
        day: today,
        sensorData: new Map(), // <-- au lieu de {}
        usagePeriods: []
      };
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
