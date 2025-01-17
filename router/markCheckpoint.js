const checkPointSchema = require('../model/checkPointSchema');
const teamSchema = require('../model/teamSchema');
const teamschema = require('../model/teamSchema');
const express = require('express');

const checkPointRoute = express.Router();

// Predefined
const checkpointWindows = [
    { start: "2025-01-18T00:23", end: "2025-01-18T00:28" },
    { start: "2025-01-18T03:37", end: "2025-01-18T03:42" },
    { start: "2025-01-18T04:19", end: "2025-01-18T04:24" },
    { start: "2025-01-18T06:32", end: "2025-01-18T06:37" },
    { start: "2025-01-18T09:10", end: "2025-01-18T09:15" },
    { start: "2025-01-18T10:25", end: "2025-01-18T10:30" },
    { start: "2025-01-18T12:15", end: "2025-01-18T12:20" },
    { start: "2025-01-18T13:25", end: "2025-01-18T13:30" },
    { start: "2025-01-18T15:37", end: "2025-01-18T15:42" },
    { start: "2025-01-18T20:56", end: "2025-01-18T21:01" },
    { start: "2025-01-18T23:00", end: "2025-01-18T23:05" },
    { start: "2025-01-19T00:36", end: "2025-01-19T00:41" },
    { start: "2025-01-19T03:53", end: "2025-01-19T03:58" },
    { start: "2025-01-19T04:15", end: "2025-01-19T04:20" },
    { start: "2025-01-19T04:43", end: "2025-01-19T04:48" },
    { start: "2025-01-19T06:10", end: "2025-01-19T06:15" },
    { start: "2025-01-19T09:25", end: "2025-01-19T09:30" },
    { start: "2025-01-19T12:30", end: "2025-01-19T12:35" },
    { start: "2025-01-19T14:04", end: "2025-01-19T14:09" },
    { start: "2025-01-19T15:08", end: "2025-01-19T15:13" }
];

checkPointRoute.post('/checkpoints', async (req, res) => {
    try {
        const { teamId, time } = req.body;

        // Validate input
        if (!teamId || !time) {
            return res.status(400).json({ message: 'Team ID and time are required' });
        }

        const now = new Date();
        const utcTime = now.getTime(); // UTC time in milliseconds
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
        const istTime = new Date(utcTime + istOffset); // Adjust to IST

        const currentTime = istTime.toISOString().slice(0, 16); // e.g., "2025-01-17T20:38"

        // Check if the current time falls within any checkpoint window
        const isWindowOpen = checkpointWindows.some((window) => {
            return currentTime >= window.start && currentTime < window.end;
        });

        if (!isWindowOpen) {
            return res.status(400).json({ message: 'Checkpoint window is closed' });
        }

        // Find or create the checkpoint
        let checkpoint = await checkPointSchema.findOne({ time });
        if (!checkpoint) {
            checkpoint = new checkPointSchema({ time, teamsResponded: [] });
            await checkpoint.save();
        }

        // Check if the team has already responded
        if (checkpoint.teamsResponded.includes(teamId)) {
            return res.status(400).json({ message: 'Checkpoint already marked for this team' });
        }

        // Mark the team as responded in the checkpoint schema
        checkpoint.teamsResponded.push(teamId);
        await checkpoint.save();

        // Update the team's checkpoint record
        const team = await teamschema.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the team already has a record for this timestamp
        const existingCheckpoint = team.checkpoints.find((cp) => cp.time === time);

        if (existingCheckpoint) {
            // If a checkpoint already exists, do not allow updates
            return res.status(400).json({ message: 'Checkpoint already marked for this team (either Passed or Missed)' });
        }

        // Add a new checkpoint entry with status 'Passed'
        team.checkpoints.push({ time, status: 'Passed' });
        await team.save();

        res.status(200).json({ message: 'Checkpoint passed successfully', team, checkpoint });
    } catch (error) {
        console.error('Error marking checkpoint:', error);
        res.status(500).json({ message: 'Error marking checkpoint', error });
    }
});

checkPointRoute.post('/teams/remove-checkpoints', async (req, res) => {
    try {
        // List of times to delete
        const  times  = req.body;

        // Validate input
        if (!Array.isArray(times) || times.length === 0) {
            return res.status(400).json({ message: 'Invalid input: Provide an array of times to delete.' });
        }

        // Perform the deletion for all teams
        const result = await teamSchema.updateMany(
            {}, // Matches all teams
            { $pull: { checkpoints: { time: { $in: times } } } }, // Removes checkpoints with matching times
            { multi: true } // Ensures it applies to all matching documents
        );

        res.status(200).json({
            message: 'Checkpoints removed successfully.',
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error removing checkpoints:', error);
        res.status(500).json({ message: 'Error removing checkpoints', error });
    }
});

module.exports = checkPointRoute;
