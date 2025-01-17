const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: { type: [String], required: true },
    checkpoints: [
        {
            time: { type: String, required: true },
            status: { type: String, enum: ['Passed', 'Missed'], default: 'Missed' },
        },
    ],
});

module.exports = mongoose.model('Team', teamSchema);
