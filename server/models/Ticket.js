const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: process.env.MONGO_Collection_User,
        required: true
    },
    type: {
        type: String,
        enum: ['GRADE_UPGRADE', 'MACHINE_DELETION', 'MACHINE_CREATION'],
        required: true
    },
    machineData: {
        type: Object,
        required: function() { return this.type === 'MACHINE_CREATION'; }
    },
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: process.env.MONGO_Collection_Machine
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    currentGrade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: process.env.MONGO_Collection_Grade,
        required: true
    },
    targetGrade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: process.env.MONGO_Collection_Grade,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    processedAt: Date,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: process.env.MONGO_Collection_User,
    },
    reason: String
});

module.exports = mongoose.model(process.env.MONGO_Collection_Ticket, ticketSchema);
