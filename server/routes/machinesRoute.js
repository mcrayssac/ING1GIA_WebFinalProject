const express = require('express');
const Machine = require('../models/Machine');
const Sensor = require('../models/Sensor');
const { verifyToken, isAdmin } = require('../middlewares/authMiddlewares');
const router = express.Router();

/**
 * @route POST /api/machines
 * @desc   Créer une nouvelle machine
 * @access Admin
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const m = new Machine(req.body);
    await m.save();
    res.status(201).json(m);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route GET /api/machines
 * @desc   Lister toutes les machines
 * @access Authenticated
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const list = await Machine.find().populate('availableSensors');
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route POST /api/machines/:id/start-cycle
 * @desc   Démarrer un cycle d'1h sur la machine (incrémente totalCycles, ajoute l’utilisateur)
 * @access Authenticated
 */
router.post('/:id/start-cycle', verifyToken, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).send('Machine not found');

    await machine.startCycle(req.user._id);
    return res.json({ message: 'Cycle démarré', machine });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

/**
 * @route POST /api/machines/:id/sensors
 * @desc   Ajouter un capteur à la machine
 * @access Admin
 * @body   { name, requiredGrade }
 */
router.post('/:id/sensors', verifyToken, isAdmin, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).send('Machine not found');

    const { name, requiredGrade } = req.body;
    const s = new Sensor({ machine: machine._id, name, requiredGrade });
    await s.save();

    machine.availableSensors.push(s._id);
    await machine.save();

    res.status(201).json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route POST /api/machines/:mid/sensors/:sid/readings
 * @desc   Ajouter une lecture de capteur (avec user)
 * @access Authenticated
 * @body   { value }
 */
router.post('/:mid/sensors/:sid/readings', verifyToken, async (req, res) => {
  try {
    const { value } = req.body;
    const sensor = await Sensor.findById(req.params.sid);
    if (!sensor) return res.status(404).send('Sensor not found');

    // Vérifie que le capteur appartient bien à la machine
    if (sensor.machine.toString() !== req.params.mid) {
      return res.status(400).send('Sensor does not belong to this machine');
    }

    sensor.readings.push({
      value,
      user: req.user._id
    });
    await sensor.save();

    res.json({ message: 'Lecture ajoutée', sensor });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
