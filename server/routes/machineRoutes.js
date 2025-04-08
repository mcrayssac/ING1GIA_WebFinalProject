const express = require('express');
const Machine = require('../models/Machine'); // Adapte le chemin selon ton projet
const { verifyToken, isAdmin } = require('../middlewares/authMiddlewares');
const router = express.Router();

/**
 * Fonctionnalité : Créer une nouvelle machine.
 * @route POST /machines
 * @access Private (admin only)
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const machine = new Machine(req.body);
    await machine.save();
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonctionnalité : Récupérer la liste de toutes les machines.
 * @route GET /machines
 * @access Private (utilisateurs authentifiés)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonctionnalité : Récupérer une machine par son ID.
 * @route GET /machines/:id
 * @access Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).send('Machine not found');
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonctionnalité : Mettre à jour une machine par son ID.
 * @route PUT /machines/:id
 * @access Private (admin only)
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!machine) return res.status(404).send('Machine not found');
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonctionnalité : Supprimer une machine par son ID.
 * @route DELETE /machines/:id
 * @access Private (admin only)
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).send('Machine not found');
    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonctionnalité : Ajouter une lecture de capteur à une machine.
 * @route POST /machines/:id/sensor-reading
 * @access Private (utilisateur authentifié)
 *
 * Données attendues dans le body :
 * {
 *    "sensorName": "Pression",  // Nom du capteur
 *    "value": 102.5             // Valeur du relevé
 * }
 */
router.post('/:id/sensor-reading', verifyToken, async (req, res) => {
  try {
    const { sensorName, value } = req.body;
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).send('Machine not found');

    // Utilise la méthode addSensorReading du modèle Machine,
    // en passant l'ID de l'utilisateur depuis req.user.
    await machine.addSensorReading(sensorName, value, req.user._id);
    res.json({ message: 'Sensor reading added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonctionnalité : Ajouter une période d'utilisation à une machine.
 * Cette route enregistre une session d'utilisation pour une journée.
 * @route POST /machines/:id/usage-period
 * @access Private (utilisateur authentifié)
 *
 * Données attendues dans le body :
 * {
 *    "startTime": "2025-04-01T08:00:00.000Z",
 *    "endTime": "2025-04-01T09:00:00.000Z"
 * }
 * (L'ID de l'utilisateur peut être récupéré via req.user)
 */
router.post('/:id/usage-period', verifyToken, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).send('Machine not found');

    // Utilise l'ID de l'utilisateur connecté
    const userId = req.user._id;
    
    // Calcul de la date du jour à partir de startTime
    const day = new Date(new Date(startTime).getFullYear(), new Date(startTime).getMonth(), new Date(startTime).getDate());
    let dailyRecord = machine.usageStats.find(record => {
      return new Date(record.day).getTime() === day.getTime();
    });
    if (!dailyRecord) {
      dailyRecord = { day, sensorData: new Map(), usagePeriods: [] };
      machine.usageStats.push(dailyRecord);
      dailyRecord = machine.usageStats[machine.usageStats.length - 1];
    }
    // Ajouter la période d'utilisation à dailyRecord
    dailyRecord.usagePeriods.push({ user: userId, startTime, endTime });
    await machine.save();
    res.json({ message: 'Usage period added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fonctionnalité : Démarrer un cycle de travail sur une machine.
 * Lorsqu'un utilisateur clique sur "travailler", cette route :
 * - Vérifie si la capacité de la machine est respectée.
 * - Ajoute l'utilisateur à l'array currentUsers s'il n'est pas déjà présent.
 * - Met à jour le status de la machine en "in-use".
 * 
 * Le cycle de travail, d'une durée d'une heure, est censé se terminer automatiquement.
 * @route POST /machines/:id/start-work
 * @access Private (utilisateur authentifié)
 */
router.post('/:id/start-work', verifyToken, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).send('Machine not found');

    const userId = req.user._id.toString();

    // Vérifier si l'utilisateur travaille déjà sur cette machine
    const alreadyWorking = machine.currentUsers.some(u => u.toString() === userId);

    // Gestion des machines à utilisateur unique
    if (machine.maxUsers === 1 && machine.currentUsers.length === 1 && !alreadyWorking) {
      return res.status(403).json({ message: 'Machine is currently in use by another user' });
    }
    
    // Pour les machines à multi-utilisateurs, vérifier la capacité
    if (machine.currentUsers.length >= machine.maxUsers && !alreadyWorking) {
      return res.status(403).json({ message: 'Maximum number of users reached for this machine' });
    }
    
    // Ajouter l'utilisateur s'il n'est pas déjà présent
    if (!alreadyWorking) {
      machine.currentUsers.push(userId);
    }

    // Mettre à jour le status de la machine
    machine.status = 'in-use';

    await machine.save();

    // Ici, lancer la simulation de données via un job planifié pourrait être fait par un autre processus
    // qui s'exécuterait pendant la durée du cycle (par exemple 1 heure).

    res.json({ message: 'Work cycle started successfully', machine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
