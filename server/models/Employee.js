const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    department: { 
        type: String, 
        required: true 
    },
    position: { 
        type: String, 
        required: true 
    },
    office: {
        type: String,
        required: true
    },
    hireDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    contractType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
        required: true,
        default: 'Full-time'
    },
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: process.env.MONGO_Collection_Site,
        required: true
    }
});

module.exports = mongoose.model(process.env.MONGO_Collection_Employee, employeeSchema);
