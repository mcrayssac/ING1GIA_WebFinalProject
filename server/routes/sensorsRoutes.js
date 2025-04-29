const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensors");

// GET all sensors
router.get("/", async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sensors" });
  }
});


// PUT update a sensor by ID
router.put("/:id", async (req, res) => {
      try {
        const updatedSensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators on the update
        });
        if (!updatedSensor) return res.status(404).json({ error: "Sensor not found" });
        res.json(updatedSensor);
      } catch (err) {
        res.status(500).json({ error: "Failed to update sensor" });
      }
    });
    

// POST add a new sensor
router.post("/", async (req, res) => {
  try {
    const newSensor = new Sensor(req.body);
    await newSensor.save();
    res.status(201).json(newSensor);
  } catch (err) {
    res.status(500).json({ error: "Failed to add sensor" });
  }
});

// DELETE a sensor by ID
router.delete("/:id", async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!sensor) return res.status(404).json({ error: "Sensor not found" });
    res.status(200).json({ message: "Sensor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete sensor" });
  }
});

// GET a single sensor by ID
router.get("/:id", async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) return res.status(404).json({ error: "Sensor not found" });
    res.json(sensor);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sensor" });
  }
});

module.exports = router;
