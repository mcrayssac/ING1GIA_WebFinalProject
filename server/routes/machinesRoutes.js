// routes/machines.js - Consolidated machine routes
const express = require("express");
const router = express.Router();
const Machine = require("../models/Machines");
const User = require("../models/User");
const mongoose = require("mongoose");


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

// Get a single machine by ID
router.get("/:id", async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id).populate('availableSensors');
    if (!machine) return res.status(404).json({ error: "Machine not found" });
    res.json(machine);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID or server error" });
  }
});


router.post("/:id/start-cycle", async (req, res) => {
  const machineId = req.params.id;
  const userId = "6811ca61af36482fce7c3939"; // utilisateur temporaire codé en dur

  try {
    const machine = await Machine.findById(machineId);
    const user = await User.findById(userId);

    if (!machine) return res.status(404).json({ error: "Machine not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.hasActiveCycle) {
      return res.status(400).json({ error: "User already has an active cycle" });
    }

    if (machine.currentUsers.length >= machine.maxUsers) {
      return res.status(400).json({ error: "Machine has reached max users" });
    }

    // Ajout immédiat des points
    user.points += machine.pointsPerCycle;
    user.hasActiveCycle = true;
    await user.save();

    // Mise à jour de la machine
    machine.currentUsers.push(user._id);

    // Mise à jour du statut de la machine
    if (machine.currentUsers.length >= machine.maxUsers) {
      machine.status = "blocked";
    } else {
      machine.status = "in-use";
    }

    // Enregistrement d’une période d’utilisation (1 minute à partir de maintenant)
    const now = new Date();
    //cycle de 1 min
    const end = new Date(now.getTime() + 60 * 1000); // + 1 minute

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let dailyStats = machine.usageStats.find(s => s.day.getTime() === today.getTime());
    if (!dailyStats) {
      dailyStats = { day: today, sensorData: new Map(), usagePeriods: [] };
      machine.usageStats.push(dailyStats);
      dailyStats = machine.usageStats[machine.usageStats.length - 1];
    }

    dailyStats.usagePeriods.push({
      user: user._id,
      startTime: now,
      endTime: end
    });

    await machine.save();

    res.status(200).json({ message: "Cycle started successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;