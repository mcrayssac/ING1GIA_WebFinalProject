const express = require('express');
const router = express.Router();

const Site = require('../models/Site');
const Employee = require('../models/Employee');
const Machine = require('../models/Machine');
const User = require('../models/User');

const { verifyToken } = require('../middlewares/authMiddlewares');

/**
 * @route GET /.../sites
 * @desc Returns all sites from the database
 * @access Public
 * 
 * @usage Example request:
 * GET /.../sites
 * 
 * @returns {JSON} Array of site objects
 */
router.get('/', async (req, res) => {
    try {
        const sites = await Site.find();
        res.json(sites);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @route GET /.../sites/:id
 * @desc Returns detailed information about a specific site including its employees and machines
 * @access Public
 * 
 * @usage Example request:
 * GET /.../sites/12345
 * 
 * @returns {JSON} Site object with related employees and machines
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        // Get the site
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: "Site not found" });
        }

        // Get employees at this site
        const employees = await Employee.find({ site: req.params.id })
            .select('_id employeeId department position contractType office hireDate');

        // Get machines at this site with grade filtering
        let machines = await Machine.find({ site: req.params.id })
            .select('name mainPole subPole requiredGrade status')
            .populate('requiredGrade', 'level name');

        // Filter machines based on user's grade if not admin
        if (!req.user.admin) {
            // Get user with populated grade
            const user = await User.findById(req.user._id).populate('grade', 'level name');
            if (user && user.grade) {
                machines = machines.filter(machine => 
                    machine.requiredGrade && 
                    machine.requiredGrade.level <= user.grade.level
                );
            } else {
                machines = []; // If user has no grade, they can't see any machines
            }
        }

        // Combine all data
        const response = {
            site,
            employees,
            machines
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching site details",
            error: error.message
        });
    }
});

/**
 * @route PATCH /.../sites/:id/join
 * @desc Updates an employee's site assignment
 * @access Private - Requires authentication
 * 
 * @usage Example request:
 * PATCH /.../sites/12345/join
 * 
 * @returns {JSON} Updated employee details
 */
router.patch('/:id/join', verifyToken, async (req, res) => {
    try {
        // Find and update employee using employeeId from user
        const employee = await Employee.findById(req.user.employee);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Update employee's site
        employee.site = req.params.id;
        await employee.save();

        // Return updated employee with populated site
        const updatedEmployee = await Employee.findById(req.user.employee)
            .populate('site', 'name markerType');

        res.json({
            success: true,
            message: "Site assignment updated successfully",
            employee: updatedEmployee
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating site assignment",
            error: error.message
        });
    }
});

module.exports = router;
