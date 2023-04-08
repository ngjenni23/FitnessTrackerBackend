const express = require('express');
const routineActivitiesRouter = express.Router();
const { JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const { updateRoutineActivity,
        getRoutineActivityById,
        getRoutineById,
        getUserById,
        destroyRoutineActivity
    } = require("../db");

// PATCH /api/routine_activities/:routineActivityId !!!NOT WORKING!!!
routineActivitiesRouter.patch('/:routineActivityId', async(req, res, next) => {
    const authHeader = req.headers.authorization;
    const { routineActivityId } = req.params;
    const { ...fields } = req.body;
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);

    try{
        if (!authHeader) {
            res.status(401).send({
                error: "error",
                name: "NotLoggedIn",
                message:"You must be logged in to perform this action"
            })
        } else {
            const token = authHeader.split(" ")[1]
            const decoded = jwt.verify(token, JWT_SECRET)
            const userId = decoded.id
            const user = await getUserById(userId)

            if (routine.creatorId !== user.id) {
                res.status(403).send({
                    error: 'error',
                    name: 'NotOwner',
                    message: `User ${user.username} is not allowed to update ${routine.name}`
                });
            } else {
                const newRoutineActivity = await updateRoutineActivity({ id: routineActivityId, ...fields});
                res.send(newRoutineActivity);
            }
        }
    } catch ({ name, message }) {
        next ({ name, message })
    }
})

// DELETE /api/routine_activities/:routineActivityId !!!NOT WORKING!!!
routineActivitiesRouter.delete("/:routineActivityId", async(req, res, next) => {
    const authHeader = req.headers.authorization
    const { routineActivityId } = req.params
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);

    try {
        if (!authHeader) {
            res.status(401).send({
            error: "error",
            name: "NotLoggedIn",
            message:"You must be logged in to perform this action"
            })
        } else {
            const token = authHeader.split(" ")[1]
            const decoded = jwt.verify(token, JWT_SECRET)
            const userId = decoded.id
            const user = await getUserById(userId)
            
            if (routine.creatorId !== user.id) {
                res.status(403).send({
                    error: 'error',
                    name: 'NotOwner',
                    message: `User ${user.username} is not allowed to delete ${routine.name}`
                });
                } else {
                const deleteRoutineActivity = await destroyRoutineActivity(routineActivityId)
                res.send( deleteRoutineActivity )
                }
        }
    } catch ({name, message}) {
    next({name, message})
    }
})


module.exports = routineActivitiesRouter;
