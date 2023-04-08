const express = require('express');
const activitiesRouter = express.Router();
const { getActivityByName, 
        getActivityById, 
        getAllActivities, 
        createActivity, 
        updateActivity,
        getPublicRoutinesByActivity
    } = require('../db');


// GET /api/activities/:activityId/routines

activitiesRouter.get("/:activityId/routines", async(req, res, next) => {
    const { activityId } = req.params;
    try {
        const routines = await getPublicRoutinesByActivity({id: activityId});
        if (!routines.length) {
            res.status(404).send({
                error: "error",
                name: "NoActivityFound",
                message: `Activity ${activityId} not found`
            });
        } else {
            res.send(routines)
        }
    } catch ({error}){
        next({error})
    }
})

// GET /api/activities

activitiesRouter.get('/', async(req, res, next) => {
    try {
        const allActivities = await getAllActivities();
        res.send(allActivities);
    } catch ({ name, message }) {
        next ({ name, message });
    }
})

// POST /api/activities

activitiesRouter.post('/', async(req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({
            error: "error",
            name: "NotLoggedIn",
            message: "You must be logged in to perform this action"
        })
    } else {
        try{
           const { name, description } = req.body;
           const existingActivityNames = await getActivityByName(name);
           if(existingActivityNames) {
                res.send({
                    error: "error",
                    name: "ActivityNameTaken",
                    message: `An activity with name ${name} already exists`
                })
           } else if (!name || !description) {
                res.send ({
                    error: "error",
                    name: "MissingFields",
                    message: "Missing activity name or description"
                })
           } else {
                const newActivity = await createActivity({ name, description });
                res.send(newActivity);
           }
        } catch ({ name, message }) {
        next ({ name, message });
        }
    }
})

// PATCH /api/activities/:activityId

activitiesRouter.patch('/:activityId', async(req, res, next) => {
    const { activityId } = req.params;
    const { name, ...fields} = req.body;

    try{ 
        const verifyActivityId = await getActivityById(activityId);
        const existingActivityNames = await getActivityByName(name);
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.send({
                error: "error",
                name: "NotLoggedIn",
                message: "You must be logged in to perform this action"
            });
        } else if (!verifyActivityId) {
            res.status(404).send({ 
                error: "error",
                name: "NoActivityIdFound",
                message: `Activity ${activityId} not found`
            });
        } else if (existingActivityNames && activityId !== existingActivityNames.id) {
            res.status(404).send({
                error: "error",
                name: "ActivityNameTaken",
                message: `An activity with name ${name} already exists`
            });
        } else {
            const updateFields = { ...fields };
            if (name) {
                updateFields.name = name;
            }
            const activityUpdate = await updateActivity({ id: activityId, ...updateFields});
            res.send(activityUpdate);
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

module.exports = activitiesRouter;
