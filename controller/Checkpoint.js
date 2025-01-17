// const Checkpoint = require('./models/Checkpoint');
// const express = require('express');
// const checkPointRoute = express.Router();

// const checkpointWindows = [
//     { start: "2025-01-17T20:38", end: "2025-01-17T20:43" },
//     { start: "2025-01-17T22:04", end: "2025-01-17T22:09" },
//     { start: "2025-01-17T23:08", end: "2025-01-17T23:13" },
//     { start: "2025-01-18T00:23", end: "2025-01-18T00:28" },
//     { start: "2025-01-18T03:37", end: "2025-01-18T03:42" },
//     { start: "2025-01-18T04:19", end: "2025-01-18T04:24" },
//     { start: "2025-01-18T06:32", end: "2025-01-18T06:37" },
//     { start: "2025-01-18T09:10", end: "2025-01-18T09:15" },
//     { start: "2025-01-18T10:25", end: "2025-01-18T10:30" },
//     { start: "2025-01-18T12:15", end: "2025-01-18T12:20" },
//     { start: "2025-01-18T13:25", end: "2025-01-18T13:30" },
//     { start: "2025-01-18T15:37", end: "2025-01-18T15:42" },
//     { start: "2025-01-18T20:56", end: "2025-01-18T21:01" },
//     { start: "2025-01-18T23:00", end: "2025-01-18T23:05" },
//     { start: "2025-01-19T00:36", end: "2025-01-19T00:41" },
//     { start: "2025-01-19T03:53", end: "2025-01-19T03:58" },
//     { start: "2025-01-19T04:15", end: "2025-01-19T04:20" },
//     { start: "2025-01-19T04:43", end: "2025-01-19T04:48" },
//     { start: "2025-01-19T06:10", end: "2025-01-19T06:15" },
//     { start: "2025-01-19T09:25", end: "2025-01-19T09:30" }
// ];

// checkPointRoute.post('/checkpoints', async (req, res) => {
//     try {
//         const { teamId, time } = req.body;

//         // Get the current time in ISO format up to the minute
//         const currentTime = new Date().toISOString().slice(0, 16); // e.g., "2025-01-17T20:38"

//         // Check if the current time falls within any checkpoint window
//         const isWindowOpen = checkpointWindows.some((window) => {
//             return currentTime >= window.start && currentTime < window.end;
//         });

//         if (!isWindowOpen) {
//             return res.status(400).json({ message: 'Checkpoint window is closed' });
//         }

//         const existingCheckpoint = await Checkpoint.findOne({ time });
//         if (existingCheckpoint && existingCheckpoint.teamsResponded.includes(teamId)) {
//             return res.status(400).json({ message: 'Checkpoint already marked for this team' });
//         }

//         // Mark the team as passed
//         const checkpoint = await Checkpoint.findOneAndUpdate(
//             { time },
//             { $addToSet: { teamsResponded: teamId } },
//             { upsert: true, new: true }
//         );

//         const team = await Team.findByIdAndUpdate(
//             teamId,
//             { $addToSet: { checkpoints: { time, status: 'Passed' } } },
//             { new: true }
//         );

//         res.status(200).json({ message: 'Checkpoint passed', team, checkpoint });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: 'Error marking checkpoint', error });
//     }
// });

// module.exports = router;
