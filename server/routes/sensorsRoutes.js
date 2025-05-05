const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensor");
const Grade = require("../models/Grade");
const User = require("../models/User");
const Machine = require("../models/Machine");
const { verifyToken, isAdmin } = require("../middlewares/authMiddlewares");

// GET all sensors
router.get("/", verifyToken, async (req, res) => {
    try {
        let sensors = await Sensor.find();

        // If user is not admin, filter by grade cap
        if (!req.user.admin) {
            const [user, grades] = await Promise.all([
                User.findById(req.user._id).populate('grade', 'name cap'),
                Grade.find({}).select('name cap')
            ]);

            if (user && user.grade) {
                const gradesByCap = Object.fromEntries(grades.map(g => [g.name, g.cap]));
                sensors = sensors.filter(sensor =>
                    sensor.requiredGrade &&
                    gradesByCap[sensor.requiredGrade] <= user.grade.cap
                );
            } else {
                sensors = []; // If user has no grade, they can't see any sensors
            }
        }

        res.json(sensors);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sensors" });
    }
});


// PUT update a sensor by ID
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
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
router.post("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const newSensor = new Sensor(req.body);
        await newSensor.save();
        res.status(201).json(newSensor);
    } catch (err) {
        res.status(500).json({ error: "Failed to add sensor" });
    }
});

// DELETE a sensor by ID
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        // Check if any machines are using this sensor
        const linkedMachines = await Machine.find({ availableSensors: req.params.id });
        if (linkedMachines.length > 0) {
            return res.status(400).json({
                error: "Cannot delete sensor that is linked to machines",
                linkedMachinesCount: linkedMachines.length
            });
        }

        const sensor = await Sensor.findByIdAndDelete(req.params.id);
        if (!sensor) return res.status(404).json({ error: "Sensor not found" });
        res.status(200).json({ message: "Sensor deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete sensor" });
    }
});

// GET a single sensor by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const sensor = await Sensor.findById(req.params.id);
        if (!sensor) return res.status(404).json({ error: "Sensor not found" });

        // If user is not admin, check grade access
        if (!req.user.admin) {
            const [user, grades] = await Promise.all([
                User.findById(req.user._id).populate('grade', 'name cap'),
                Grade.find({}).select('name cap')
            ]);

            if (!user || !user.grade) {
                return res.status(403).json({ error: "You don't have the required grade to access this sensor" });
            }

            const gradesByCap = Object.fromEntries(grades.map(g => [g.name, g.cap]));
            if (gradesByCap[sensor.requiredGrade] > user.grade.cap) {
                return res.status(403).json({ error: "You don't have the required grade to access this sensor" });
            }
        }

        res.json(sensor);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sensor" });
    }
});

module.exports = router;
