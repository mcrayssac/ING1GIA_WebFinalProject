const express = require("express");
const Employee = require("../models/Employee");
const User = require("../models/User");
const crypto = require("crypto");
require('dotenv').config();
const nodemailer = require("nodemailer");
const Grade = require("../models/Grade");

const router = express.Router();

// Token storage for verification and password reset
const verificationTokens = new Map();
const resetTokens = new Map();

// Reset token expiry time (15 minutes)
const RESET_TOKEN_EXPIRY = 15 * 60 * 1000;

/**
 * @route POST /.../auth/request-signup
 * @desc Request signup token for an employee
 * @access Public
 *
 * @usage Example request:
 * POST /.../auth/request-signup
 * Body:
 * {
 *   employeeId: "12345",
 *   email: "example@example.com"
 * }
 * Content-Type: application/json
 * 
 * @returns {JSON} Message indicating success or failure
 */
router.post("/request-signup", async (req, res) => {
    try {
        const { employeeId, email } = req.body;

        const employee = await Employee.findOne({ employeeId, email });
        if (!employee) {
            return res.status(400).json({ message: "Invalid Employee ID or email" });
        }

        // Generate a random verification token
        const token = crypto.randomBytes(32).toString("hex");
        verificationTokens.set(token, email);
        const verificationLink = `${process.env.ORIGIN_LOCAL}/verify-signup?token=${token}`;

        // NodeMailer configuration
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        // Send email
        await transporter.sendMail({
            from: `"SPACE Y" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Confirm Your Registration",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2c3e50;">Welcome to Space Y web site</h2>
                    <p>Hi there,</p>
                    <p>Thank you for registering. To complete your registration, please confirm your email address by clicking the button below:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                            Confirm Email
                        </a>
                    </p>
                    <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                    <p style="word-break: break-all;">${verificationLink}</p>
                    <p>Thanks,<br/>The Team</p>
                </div>
            `
        });

        res.json({ message: "Verification email sent" });
    } catch (error) {
        console.error("Error sending verification email: ", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route GET /.../auth/verify-token
 * @desc Verify the signup token
 * @access Public
 *
 * @usage Example request:
 * GET /.../auth/verify-token?token=abc123
 *
 * @returns {JSON} Message indicating success or failure
 */
router.get("/verify-token", (req, res) => {
    try {
        const { token } = req.query;
        if (!verificationTokens.has(token)) {
            return res.status(400).json({ success: false, message: "Invalid token" });
        }

        const email = verificationTokens.get(token);
        verificationTokens.delete(token);
        res.json({ success: true, email });
    } catch (error) {
        console.error("Error verifying token: ", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route POST /.../auth/create-user
 * @desc Create a new user
 * @access Public
 *
 * @usage Example request:
 * POST /.../auth/create-user
 * Body:
 * {
 *   username: "newuser",
 *   password: "password123",
 *   email: "newuser@example.com"
 * }
 * Content-Type: application/json
 *
 * @returns {JSON} Message indicating success or failure
 */
router.post("/create-user", async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Already existing user check
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Check if the email is already linked to an employee
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(400).json({ message: "Employee not found for this email" });
        }
        // Set default grade based on lower points threshold (default "Apprentice")
        const defaultGrade = await Grade.findOne({ name: "Apprentice" });

        // New user creation
        const newUser = new User({
            username,
            email,
            password,
            employee: employee._id,
            grade: defaultGrade ? defaultGrade._id : null
        });
        await newUser.save();

        res.status(201).json({ message: "Account created successfully! You can now log in." });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Handle other errors
        console.error("Error creating user: ", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route POST /.../auth/forgot-password
 * @desc Request password reset token
 * @access Public
 */
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "If a user with this email exists, they will receive a password reset link." });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        const expiryTime = Date.now() + RESET_TOKEN_EXPIRY;
        resetTokens.set(token, { email, expiry: expiryTime });

        const resetLink = `${process.env.ORIGIN_LOCAL}/reset-password?token=${token}`;

        // Send email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        await transporter.sendMail({
            from: `"SPACE Y" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2c3e50;">Password Reset Request</h2>
                    <p>Hi there,</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                            Reset Password
                        </a>
                    </p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p>This link will expire in 15 minutes.</p>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all;">${resetLink}</p>
                    <p>Thanks,<br/>The Team</p>
                </div>
            `
        });

        res.json({ message: "If a user with this email exists, they will receive a password reset link." });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ message: "An error occurred" });
    }
});

/**
 * @route POST /.../auth/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify token exists and hasn't expired
        const tokenData = resetTokens.get(token);
        if (!tokenData || Date.now() > tokenData.expiry) {
            resetTokens.delete(token);
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Update user's password
        const user = await User.findOne({ email: tokenData.email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        user.password = newPassword;
        await user.save();

        // Delete used token
        resetTokens.delete(token);

        res.json({ message: "Password reset successful. You can now log in with your new password." });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ message: "An error occurred" });
    }
});

module.exports = router;
