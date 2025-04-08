const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    urls: {
        type: Map,
        of: String,
    },
    dob: { type: Date },
    location: { type: String },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
    photo: { data: Buffer, contentType: String },
    points: { type: Number, default: 0 },
    // Nouveaux champs pour l'accès aux machines
    accessibleSites: { type: [String], default: [] },
    accessiblePoles: { type: [String], default: [] }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model(process.env.MONGO_Collection_User, userSchema);
