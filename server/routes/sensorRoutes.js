const express = require('express');
const Sensor = require('../models/Sensor');
const { verifyToken } = require('../middlewares/authMiddlewares');
const router = express.Router();

/**
 * @route GET /api/sensors/:id
 * @desc   Récupérer un capteur et ses lectures
 * @access Authenticated
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
      .populate('machine', 'name')
      .populate('readings.user', 'username');
    if (!sensor) return res.status(404).send('Sensor not found');
    res.json(sensor);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
