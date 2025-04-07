const express = require("express");
const Employee = require("../models/Employee");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require('dotenv').config();
const nodemailer = require("nodemailer");

const router = express.Router();
const verificationTokens = new Map(); // Stock temporaire des tokens

//  Vérifier l'ID employé et envoyer l'email
router.post("/request-signup", async (req, res) => {
  console.log("🔹 Requête reçue:", req.body);

  try {
    const { employeeId, email } = req.body;

    // Log : recherche dans la base
    console.log(`🔍 Recherche employé avec ID: ${employeeId}, Email: ${email}`);

    const employee = await Employee.findOne({ employeeId, email });

    if (!employee) {
      console.log("Aucun employé trouvé !");
      return res.status(400).json({ message: "Invalid Employee ID or email" });
    }

    console.log("Employé trouvé :", employee);

    const token = crypto.randomBytes(32).toString("hex");
    verificationTokens.set(token, email);
    const verificationLink = `${process.env.ORIGIN_LOCAL}/verify-signup?token=${token}`;

    console.log("🔗 Lien de vérification généré :", verificationLink);

    // Configurer nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm your registration",
      html: `<p>Click <a href="${verificationLink}">here</a> to complete your registration.</p>`
    });

    console.log(" Email envoyé à", email);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    console.error(" Erreur serveur :", error);
    res.status(500).json({ message: error.message });
  }
});

//  Vérifier le token et rediriger
router.get("/verify-token", (req, res) => {
  const { token } = req.query;
  if (!verificationTokens.has(token)) {
    return res.status(400).json({ success: false, message: "Invalid token" });
  }

  const email = verificationTokens.get(token);
  verificationTokens.delete(token);
  res.json({ success: true, email });
});

//  Créer un compte utilisateur
router.post("/create-user", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log("📥 Données reçues :", { username, email });

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Vérifie si l'email correspond à un employé
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: "Employee not found for this email" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création du User avec lien vers l'employé
    const newUser = new User({
      username,
      password: hashedPassword,
      employee: employee._id
    });

    await newUser.save();
    console.log("✅ Utilisateur créé avec succès !");
    res.status(201).json({ message: "Account created successfully! You can now log in." });

  } catch (error) {
    console.error(" Erreur lors de la création du compte :", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
