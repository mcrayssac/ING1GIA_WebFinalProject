// routes/machines.js - Consolidated machine routes
const express = require("express");
const router = express.Router();
const Machine = require("../models/Machine");
const User = require("../models/User");
const Grade = require("../models/Grade");
const mongoose = require("mongoose");
const { verifyToken, isAdmin } = require("../middlewares/authMiddlewares");

// Get all machines with filters
router.get("/", verifyToken, async (req, res) => {
    try {
        const { status, requiredGrade, search } = req.query;
        let query = {};

        if (status && status !== "all") {
            if (!['available', 'in-use', 'blocked'].includes(status)) {
                return res.status(400).json({ error: "Invalid status value" });
            }
            query.status = status;
        }
        if (requiredGrade && requiredGrade !== "all") {
            if (!['Apprentice', 'Technician', 'Engineer', 'Manager'].includes(requiredGrade)) {
                return res.status(400).json({ error: "Invalid grade value" });
            }
            query.requiredGrade = requiredGrade;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { mainPole: { $regex: search, $options: "i" } },
                { subPole: { $regex: search, $options: "i" } }
            ];
        }

        let machines = await Machine.find(query)
            .populate('site', 'name')
            .populate('availableSensors', 'designation');

        const grades = await Grade.find({}).select('name cap');
        const gradesByCap = Object.fromEntries(grades.map(g => [g.name, g.cap]));

        // If user is logged in and not admin, filter by grade cap
        if (req.user && !req.user.admin) {
            console.log("Admin user:", req.user.admin);
            const user = await User.findById(req.user._id).populate('grade', 'name cap');
            if (user && user.grade) {
                machines = machines.filter(machine => 
                    machine.requiredGrade &&
                    gradesByCap[machine.requiredGrade] <= user.grade.cap
                );
            } else {
                machines = []; // If user has no grade, they can't see any machines
            }
        }

        res.json(machines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a machine by ID
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid machine ID format" });
        }
        
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
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid machine ID format" });
        }

        // Validate required fields
        const { mainPole, subPole, name, pointsPerCycle, maxUsers, requiredGrade } = req.body;
        if (!mainPole || !subPole || !name || !pointsPerCycle || !maxUsers || !requiredGrade) {
            return res.status(400).json({ 
                error: "Missing required fields",
                required: ["mainPole", "subPole", "name", "pointsPerCycle", "maxUsers", "requiredGrade"]
            });
        }

        // Validate grade
        if (!['Apprentice', 'Technician', 'Engineer', 'Manager'].includes(requiredGrade)) {
            return res.status(400).json({ error: "Invalid grade value" });
        }

        // Validate numeric fields
        if (typeof pointsPerCycle !== 'number' || pointsPerCycle < 0) {
            return res.status(400).json({ error: "Points per cycle must be a positive number" });
        }
        if (typeof maxUsers !== 'number' || maxUsers < 1) {
            return res.status(400).json({ error: "Max users must be a positive number" });
        }

        const updatedMachine = await Machine.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedMachine) {
            return res.status(404).json({ error: "Machine not found" });
        }
        res.json(updatedMachine);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

// POST to add a new machine
router.post("/", verifyToken, async (req, res) => {
    try {
        // Validate required fields
        const { mainPole, subPole, name, pointsPerCycle, maxUsers, requiredGrade, site } = req.body;
        if (!mainPole || !subPole || !name || !pointsPerCycle || !maxUsers || !requiredGrade || !site) {
            return res.status(400).json({ 
                error: "Missing required fields",
                required: ["mainPole", "subPole", "name", "pointsPerCycle", "maxUsers", "requiredGrade", "site"]
            });
        }

        // Validate grade
        if (!['Apprentice', 'Technician', 'Engineer', 'Manager'].includes(requiredGrade)) {
            return res.status(400).json({ error: "Invalid grade value" });
        }

        // Validate numeric fields
        if (typeof pointsPerCycle !== 'number' || pointsPerCycle < 0) {
            return res.status(400).json({ error: "Points per cycle must be a positive number" });
        }
        if (typeof maxUsers !== 'number' || maxUsers < 1) {
            return res.status(400).json({ error: "Max users must be a positive number" });
        }

        // Validate site ID
        if (!mongoose.Types.ObjectId.isValid(site)) {
            return res.status(400).json({ error: "Invalid site ID format" });
        }

        const newMachine = new Machine(req.body);
        await newMachine.save();
        res.status(201).json(newMachine);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: "Failed to add machine" });
    }
});

// Helper function to find active cycle for user
const findActiveCycle = (usageStats, userId) => {
    if (!usageStats || !usageStats.length) return null;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStats = usageStats.find(stat => 
        new Date(stat.day).getTime() === today.getTime()
    );

    if (!todayStats || !todayStats.usagePeriods) return null;

    // Find the user's active cycle
    return todayStats.usagePeriods.find(period => 
        period.user.toString() === userId.toString() && 
        new Date(period.endTime) > new Date()
    );
}

// Get a machine by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        // First get the machine with all its data
        const [machine, grades] = await Promise.all([
            Machine.findById(id)
                .populate('site', 'name coordinates description')
                .populate('availableSensors', 'designation requiredGrade')
                .populate('currentUsers', 'username')
                .lean(),
            Grade.find({}).select('name cap')
        ]);
            
        if (!machine) {
            return res.status(404).json({ error: "Machine not found" });
        }

        const gradesByCap = Object.fromEntries(grades.map(g => [g.name, g.cap]));

        // Check user's grade access if not admin
        if (!req.user.admin) {
            const user = await User.findById(req.user._id).populate('grade', 'name cap');
            if (!user || !user.grade || (machine.requiredGrade && gradesByCap[machine.requiredGrade] > user.grade.cap)) {
                return res.status(403).json({ error: "You don't have the required grade to access this machine" });
            }
        }

        // Ensure all arrays exist even if empty
        machine.availableSensors = machine.availableSensors || [];
        machine.currentUsers = machine.currentUsers || [];
        machine.usageStats = machine.usageStats || [];
        machine.totalCycles = machine.totalCycles || 0;

        // If there's an active cycle for this user, include its end time
                const activeCycle = findActiveCycle(machine.usageStats, req.user._id);
                res.json({
                    ...machine,
                    activeCycle: activeCycle ? {
                        startTime: activeCycle.startTime,
                        endTime: activeCycle.endTime,
                        initialProgress: activeCycle ? Math.min(
                            Math.max(
                                ((new Date().getTime() - new Date(activeCycle.startTime).getTime()) /
                                (new Date(activeCycle.endTime).getTime() - new Date(activeCycle.startTime).getTime())) * 100,
                                0
                            ),
                            100
                        ) : 0
                    } : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route : lancer un cycle sur une machine
router.post("/:id/start-cycle", verifyToken, async (req, res) => {
    const userId = req.user._id; // Récupérer l'ID de l'utilisateur à partir du token JWT
    const hasActiveCycle = req.user.hasActiveCycle; // Vérifier si l'utilisateur a déjà un cycle actif
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    const machineId = req.params.id;
    console.log("Machine ID:", machineId);
    console.log("User ID:", userId);
    try {
        const user = await User.findById(userId);
        if (!userId) return res.status(404).json({ error: "User not found" });
        if (hasActiveCycle)
            return res.status(400).json({ error: "User already in active cycle" });

        const [machine, grades] = await Promise.all([
            Machine.findById(machineId)
                .populate("availableSensors"),
            Grade.find({}).select('name cap')
        ]);
        if (!machine) return res.status(404).json({ error: "Machine not found" });

        const gradesByCap = Object.fromEntries(grades.map(g => [g.name, g.cap]));

        // Check user's grade access if not admin
        if (!req.user.admin) {
            const fullUser = await User.findById(userId).populate('grade', 'name cap');
            if (!fullUser || !fullUser.grade || (machine.requiredGrade && gradesByCap[machine.requiredGrade] > fullUser.grade.cap)) {
                return res.status(403).json({ error: "You don't have the required grade to use this machine" });
            }
        }

        if (machine.currentUsers.length >= machine.maxUsers)
            return res.status(400).json({ error: "Machine has reached max users" });

        // 1. Marquer l'utilisateur comme actif
        user.hasActiveCycle = true;
        user.points += machine.pointsPerCycle;
        await user.save();

        // 2. Ajouter le user à la machine
        machine.currentUsers.push(user._id);

        // 3. Déterminer le nouveau statut
        if (machine.currentUsers.length >= machine.maxUsers) {
            machine.status = "blocked";
        } else {
            machine.status = "in-use";
        }

        // 4. Ajouter une période d'utilisation
        const now = new Date();
        const end = new Date(now.getTime() + 10 * 60 * 1000); // +10 minutes de cycle
        console.log("Cycle ends at:", end);

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Find today's usage stats index
        const usageStatIndex = machine.usageStats.findIndex(
            entry => entry.day.getTime() === today.getTime()
        );

        if (usageStatIndex === -1) {
            // If no entry exists for today, create a new one
            machine.usageStats.push({
                day: today,
                sensorData: new Map(),
                usagePeriods: [{
                    user: user._id,
                    startTime: now,
                    endTime: end
                }]
            });
        } else {
            // Add the new usage period to today's entry
            machine.usageStats[usageStatIndex].usagePeriods.push({
                user: user._id,
                startTime: now,
                endTime: end
            });
        }

        machine.totalCycles += 1;

        // Use markModified to ensure Mongoose detects the nested array changes
        machine.markModified('usageStats');
        await machine.save();

        // Note : génération de données fictives via script séparé ou cron
        // Vous pouvez appeler ici un script ou enregistrer un événement à traiter via queue ou worker

        return res.status(200).json({
            success: true,
            message: "Cycle démarré avec succès",
            pointsAdded: machine.pointsPerCycle,
            cycleEndsAt: end,
            cycleStartsAt: now,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

// Route : arrêter un cycle sur une machine
router.post("/:id/stop-cycle", verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const machineId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const machine = await Machine.findById(machineId);
        if (!machine) return res.status(404).json({ error: "Machine not found" });

        // Remove user from currentUsers
        machine.currentUsers = machine.currentUsers.filter(id => id.toString() !== userId.toString());

        // Update machine status
        machine.status = machine.currentUsers.length > 0 ? "in-use" : "available";

        // Mark user cycle as completed
        user.hasActiveCycle = false;
        
        await Promise.all([machine.save(), user.save()]);

        return res.status(200).json({
            success: true,
            message: "Cycle terminé avec succès"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

router.get("/:id/:sensorId", verifyToken, async (req, res, next) => {
    try {
        const { id: machineId, sensorId } = req.params;

        // 1) Machine avec capteurs peuplés et grade
        const [machine, grades] = await Promise.all([
            Machine.findById(machineId)
                .populate("availableSensors"),
            Grade.find({}).select('name cap')
        ]);
        if (!machine)
            return res.status(404).json({ error: "Machine not found" });

        const gradesByCap = Object.fromEntries(grades.map(g => [g.name, g.cap]));

        // Check user's grade access if not admin
        if (!req.user.admin) {
            const user = await User.findById(req.user._id).populate('grade', 'name cap');
            if (!user || !user.grade || (machine.requiredGrade && gradesByCap[machine.requiredGrade] > user.grade.cap)) {
                return res.status(403).json({ error: "You don't have the required grade to access this machine's sensors" });
            }
        }

        // 2) Capteur présent sur la machine ?
        const sensor = machine.availableSensors.find(
            (s) => s._id.toString() === sensorId
        );
        if (!sensor)
            return res
                .status(404)
                .json({ error: "Sensor not found on this machine" });

        // 3) Réponse
        res.json({
            machineId,
            sensor,
            usageStats: machine.usageStats,   // le front filtrera la journée voulue
            totalCycles: machine.totalCycles,
            status: machine.status,
            maxUsers: machine.maxUsers,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
