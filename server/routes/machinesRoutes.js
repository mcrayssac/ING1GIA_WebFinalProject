// routes/machines.js - Consolidated machine routes
const express = require("express");
const router = express.Router();
const Machine = require("../models/Machines");

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
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ error: "Machine not found" });
    res.json(machine);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID or server error" });
  }
});



module.exports = router;