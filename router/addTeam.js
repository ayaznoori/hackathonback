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
