const express = require('express');
const router = express.Router();
const Grade = require('../models/Grades');

// GET /api/grades - fetch all grades
router.get('/', async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

module.exports = router;
