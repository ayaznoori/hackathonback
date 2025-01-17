
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());
require("dotenv").config();


const teamRouter = require("./router/addTeam");
const checkPointRoute = require("./router/markCheckpoint");
const checkPointSchema = require("./model/checkPointSchema");
const teamschema = require("./model/teamSchema");

app.use('/autoupdate', async (req, res) => {

    try {
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
        // Get the current time in IST
        const now = new Date();
        const utcTime = now.getTime(); // UTC time in milliseconds
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
        const istTime = new Date(utcTime + istOffset); // Adjust to IST

        const currentTime = istTime.toISOString().slice(0, 16); // Format to "YYYY-MM-DDTHH:mm"

        // Filter checkpoints up to the current time
        const pastWindows = checkpointWindows.filter((window) => window.end <= currentTime);

        if (pastWindows.length === 0) {
            return res.status(400).json({ message: 'No past checkpoints to process.' });
        }

        const allTeams = await teamschema.find(); // Get all teams

        // Loop through each past window and mark teams that missed them
        await Promise.all(
            pastWindows.map(async (window) => {
                const checkpointTime = window.start; // Use the start of the window as the unique identifier

                const checkpoint = await checkPointSchema.findOne({ time: checkpointTime });
                const teamsResponded = checkpoint ? checkpoint.teamsResponded : [];

                await Promise.all(
                    allTeams.map(async (team) => {
                        // Check if the team already has a record for this checkpoint
                        const alreadyMarked = team.checkpoints.some(
                            (cp) => cp.time === checkpointTime
                        );

                        if (!alreadyMarked && !teamsResponded.includes(team._id.toString())) {
                            // Add the missed checkpoint if not already marked
                            await teamschema.findByIdAndUpdate(
                                team._id,
                                { $addToSet: { checkpoints: { time: checkpointTime, status: 'Missed' } } },
                                { new: true }
                            );
                        }
                    })
                );
            })
        );

        console.log(`Checkpoint auto-miss applied for all past time windows up to: ${currentTime}`);
        res.status(200).json({ message: `Checkpoint auto-miss applied for all past time windows up to: ${currentTime}` });
    } catch (error) {
        console.error("Error in autoupdate:", error);
        res.status(500).json({ message: "Error in autoupdate", error });
    }
});


app.use('/tm',teamRouter)
app.use('/ch',checkPointRoute)


app.listen(PORT, async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect('mongodb+srv://ncclasses:Alam%40123@cluster0.lagrdny.mongodb.net/ncclasses?retryWrites=true&w=majority');
      
      console.log(`Backend Sever is successfully running on port ${PORT}`);
    } catch (err) {
      console.log("error while connecting db", err);
    }
  });