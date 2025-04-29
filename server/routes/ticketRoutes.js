const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Grade = require("../models/Grade");
const { verifyToken, isAdmin } = require("../middlewares/authMiddlewares");

// Create a new ticket
router.post("/", verifyToken, async (req, res) => {
    try {
        const { type, targetGrade } = req.body;
        const userId = req.user._id;

        // Get current user's grade
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check for existing pending tickets
        const existingTicket = await Ticket.findOne({
            userId,
            type,
            status: { $nin: ['APPROVED', 'REJECTED'] } // Exclude completed tickets
        });

        if (existingTicket) {
            return res.status(400).json({ 
                message: "You already have a pending ticket for this request",
                existingTicket
            });
        }

        // Find current grade from user
        if (!user.grade) {
            return res.status(400).json({ message: "User has no current grade" });
        }

        // Find target grade document
        const targetGradeDoc = await Grade.findOne({ name: targetGrade });
        if (!targetGradeDoc) {
            return res.status(400).json({ message: "Invalid target grade" });
        }

        const ticket = new Ticket({
            userId,
            type,
            currentGrade: user.grade, // Already an ObjectId
            targetGrade: targetGradeDoc._id
        });

        await ticket.save();
        
        // Populate the saved ticket before sending response
        const populatedTicket = await Ticket.findById(ticket._id)
            .populate('userId', 'username email')
            .populate('currentGrade')
            .populate('targetGrade');
            
        res.status(201).json(populatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all tickets (admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate("userId", "username email grade points")
            .populate("processedBy", "username email")
            .populate("currentGrade")
            .populate("targetGrade")
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Get user's tickets
router.get("/user", verifyToken, async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user._id })
            .populate("processedBy", "username email")
            .populate("currentGrade")
            .populate("targetGrade")
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Process ticket (admin only)
router.patch("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const { status, reason } = req.body;
        const ticket = await Ticket.findById(req.params.id)
            .populate('currentGrade')
            .populate('targetGrade');

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        ticket.status = status;
        ticket.processedAt = Date.now();
        ticket.processedBy = req.user._id;
        if (reason) ticket.reason = reason;

        // If approved, update user's grade
        if (status === "APPROVED" && ticket.type === "GRADE_UPGRADE") {
            const user = await User.findById(ticket.userId);
            if (user) {
                user.grade = ticket.targetGrade; // Already an ObjectId
                await user.save();
            }
        }

        await ticket.save();

        // Return populated ticket
        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('userId', 'username email')
            .populate('processedBy', 'username email')
            .populate('currentGrade')
            .populate('targetGrade');

        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
