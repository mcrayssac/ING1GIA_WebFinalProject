
const express = require('express');
const router = express.Router();
require('dotenv').config();
const nodemailer = require('nodemailer');
const chalk = require('chalk');

/**
 * @route POST /api/send-email
 * @desc Envoie un email via Nodemailer
 * @access Public
 *
 * @example Body:
 * {
 *   "to": "destinataire@example.com",
 *   "subject": "Sujet de test",
 *   "message": "Contenu du mail"
 * }
 */
router.post('/', async (req, res) => {
    const { to, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(chalk.green('Email envoyé :'), info.response);
        res.status(200).send('Email envoyé avec succès !');
    } catch (err) {
        console.error(chalk.red('Erreur lors de l\'envoi de l\'email :'), err);
        res.status(500).send("Erreur d'envoi de l'email");
    }
});

module.exports = router;
