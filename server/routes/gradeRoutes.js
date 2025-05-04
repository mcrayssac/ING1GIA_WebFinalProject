const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const { verifyToken } = require('../middlewares/authMiddlewares');

// GET /api/grades - fetch all grades
router.get('/', verifyToken, async (req, res) => {
  try {
    const grades = await Grade.find({});
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
