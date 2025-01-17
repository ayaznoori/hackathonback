const express = require('express');
const teamSchema = require('../model/teamSchema');
const teamRouter = express.Router();

teamRouter.post('/teams', async (req, res) => {
    try {
        const { name, members } = req.body;
        if (!name || !members || members.length !== 4) {
            return res.status(400).json({ message: 'Invalid input' });
        }
        const team = new teamSchema({ name, members });
        await team.save();
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error adding team', error });
    }
});
teamRouter.post('/teams/bulk', async (req, res) => {
    try {
        const  teams  = req.body; // Expecting an array of teams
        if (!Array.isArray(teams) || teams.length === 0) {
            return res.status(400).json({ message: 'Invalid input: teams should be a non-empty array' });
        }

        // Validate each team in the array
        const invalidTeams = teams.filter(team => !team.name || !team.members);
        if (invalidTeams.length > 0) {
            return res.status(400).json({
                message: 'Some teams have invalid input',
                invalidTeams,
            });
        }

        // Save all teams to the database
        const savedTeams = await teamSchema.insertMany(teams);
        res.status(201).json({ message: 'Teams added successfully', savedTeams });
    } catch (error) {
        res.status(500).json({ message: 'Error adding teams', error });
    }
});

// Fetch all teams
teamRouter.get('/getteams', async (req, res) => {
    try {
        const teams = await teamSchema.find(); // Retrieve all teams from the database
        res.status(200).json(teams); // Return the teams as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error });
    }
});

module.exports = teamRouter;
