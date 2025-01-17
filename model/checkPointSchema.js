const mongoose = require('mongoose');

const checkpointSchema = new mongoose.Schema({
    time: { type: String, unique: true, required: true }, // Ensure 'time' is unique and required
    teamsResponded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team',unique: true }],
});
module.exports = mongoose.model('Checkpoint', checkpointSchema);
