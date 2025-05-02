const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Site = require('../models/Site');
const Product = require('../models/Product');
const Statistic = require('../models/Statistic');
const HistoryEvent = require('../models/HistoryEvent');
const News = require('../models/News');
const Machines = require('../models/Machines'); 
const Sensors = require('../models/Sensors');
const User = require('../models/User');
const Grades = require('../models/Grades');

const { sites, products, statistics, historyEvents, news, machines, sensors, users, grades } = require('../data/data');

/**
 * @route GET /api/seed
 * @desc Seeds the database with static data
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
      // 1. Clear all collections
      await Promise.all([
        Site.deleteMany({}),
        Product.deleteMany({}),
        Statistic.deleteMany({}),
        HistoryEvent.deleteMany({}),
        News.deleteMany({}),
        Machines.deleteMany({}),
        Sensors.deleteMany({}),
        User.deleteMany({}),
        Grades.deleteMany({})
      ]);
  
    // 2. Insert sensors
    const insertedSensors = await Sensors.insertMany(sensors);
    console.log("Data seeded for key: Sensors");

    // 3. Create map designation -> _id
    const sensorMap = {};
    insertedSensors.forEach(sensor => {
    sensorMap[sensor.designation] = sensor._id;
    });
    console.log("Sensor map:", sensorMap);

    // 4. Inject sensor ObjectIds into machines
    const machinesWithSensorIds = machines.map(machine => {
    const ids = (machine.availableSensors || []).map(designation => {
        const id = sensorMap[designation];
        if (!id) console.warn(`Sensor not found for designation: ${designation}`);
        return id;
    }).filter(Boolean);

    return { ...machine, availableSensors: ids };
    });      
  
      // 5. Insert all other data
    await Promise.all([
        Site.insertMany(sites),
        Product.insertMany(products),
        Statistic.insertMany(statistics),
        HistoryEvent.insertMany(historyEvents),
        News.insertMany(news),
        Machines.insertMany(machinesWithSensorIds),
        User.insertMany(users),
        Grades.insertMany(grades)
      ]);
  
      console.log("All data seeded successfully");
      return res.json({ success: true, message: "Data seeded successfully" });
    } catch (error) {
      console.error('Error seeding data:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;
  