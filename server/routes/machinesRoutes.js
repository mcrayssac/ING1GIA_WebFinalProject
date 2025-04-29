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


module.exports = router;