const express = require("express");
const router = express.Router();
const Machine = require("../models/Machines");

// Route to add a new machine
router.post("/", async (req, res) => {
  try {
    // Basic validation
    if (!req.body.name || !req.body.mainPole) {
      return res.status(400).json({ 
        error: "Missing required fields (name and mainPole are required)" 
      });
    }

    // Create and save machine
    const newMachine = new Machine({
      name: req.body.name,
      mainPole: req.body.mainPole,
      subPole: req.body.subPole || null,
      pointsPerCycle: req.body.pointsPerCycle || 0,
      maxUsers: req.body.maxUsers || 1,
      requiredGrade: req.body.requiredGrade || "basic",
      status: req.body.status || "available",
      sites: req.body.sites,  // Array of site IDs
      availableSensors: req.body.availableSensors,
    });

    const savedMachine = await newMachine.save();
    
    res.status(201).json({
      success: true,
      message: "Machine added successfully",
      data: savedMachine
    });

  } catch (err) {
    console.error("Error adding machine:", err);
    
    // Handle duplicate key errors (if name is unique)
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: "Machine with this name already exists" 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: err.message 
      });
    }

    res.status(500).json({ 
      error: "Server error while adding machine",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;

