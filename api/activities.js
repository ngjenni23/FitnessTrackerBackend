const express = require('express');
const activitiesRouter = express.Router();
const { JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const {getAllActivities, getActivityById } = require("../db/activities");

// GET /api/activities/:activityId/routines

// GET /api/activities

activitiesRouter.get('/activities', async(req, res, next) => {
    try {
        const allActivities = await getAllActivities();
        res.send(allActivities);
    } catch (error) {
        next (error);
    }
})

// POST /api/activities

// PATCH /api/activities/:activityId

module.exports = activitiesRouter;
