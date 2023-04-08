const express = require('express');
const routinesRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getAllPublicRoutines,
        getUserById,
        createRoutine,
        getRoutineById,
        updateRoutine,
        destroyRoutine,
        getActivityByRoutineAndActivityIds,
        addActivityToRoutine

} = require('../db')

// GET /api/routines
routinesRouter.get('/', async(req, res) => {
    const publicRoutines = await getAllPublicRoutines();
    res.send(publicRoutines)
})

// POST /api/routines
routinesRouter.post('/', async(req, res, next) => {
   const authHeader = req.headers.authorization;
   const { creatorId, isPublic, name, goal } = req.body;

   try{
        if (!authHeader) {
            res.send({
                error: "error",
                name: "NotLoggedIn",
                message: "You must be logged in to perform this action"
            })
        } else {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await getUserById(userId);

            await createRoutine({id: creatorId, isPublic, name, goal});
            res.send({
                creatorId: user.id,
                isPublic: isPublic,
                name: name,
                goal: goal
            });
        }
    } catch ({ name, message }) {
        next ({ name, message })
    }
})

// PATCH /api/routines/:routineId !!!NOT WORKING!!!
routinesRouter.patch('/:routineId', async (req, res, next) => {
  const authHeader = req.headers.authorization
  const {routineId} = req.params
  const { isPublic, name, goal} = req.body

  try {
    if (!authHeader) {
        res.send({
            error: "error",
            name: "NotLoggedIn",
            message:"You must be logged in to perform this action"
      })
    } 
    else {
        const routine = await getRoutineById(routineId)
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, JWT_SECRET)
        const userId = decoded.id
        const user = await getUserById(userId)

        console.log("routine", routine, "routineId", routineId);
        console.log("creatorId", routine.creatorId, "userId", user.id);
        if (routine.creatorId !== user.id) {
            res.status(403).send({
                error: 'error',
                name: 'NotOwner',
                message: `User ${user.username} is not allowed to update ${routine.name}`
            });
        } 
        await updateRoutine({ id: routineId, isPublic, name, goal })
        res.send({
            isPublic: isPublic,
            name: name,
            goal: goal
        })
     }
  } catch ({name, message}) {
    next({name, message})
  }
})

// DELETE /api/routines/:routineId !!!NOT WORKING!!!
routinesRouter.delete("/:routineId", async (req, res, next) => {
  const authHeader = req.headers.authorization
  const { routineId } = req.params

  try {
    if (!authHeader) {
      res.status(401).send({
        error: "error",
        name: "NotLoggedIn",
        message:"You must be logged in to perform this action"
      })
    } else {
        const routine = await getRoutineById(routineId)
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
            const deleteRoutine = await destroyRoutine(routineId)
            res.send( deleteRoutine )
            }
    } 
  } catch ({name, message}) {
    next({name, message})
  }
})

// POST /api/routines/:routineId/activities
routinesRouter.post("/:routineId/activities", async (req, res, next) => {
  const { routineId, activityId, count, duration } = req.body
  
  try {
    const existingActivities = await getActivityByRoutineAndActivityIds(routineId, activityId)
    
    if (existingActivities.length > 0) {
      const _routineId = existingActivities[0].routineId 
      const _activityId = existingActivities[0].activityId

      if (_routineId === routineId && _activityId === activityId) {
        return res.send({ 
          error: "This activity already exists in the routine",
          message: `Activity ID ${_activityId} already exists in Routine ID ${_routineId}`,
          name: "any string"
        })
      }
    } else {
      await addActivityToRoutine({ routineId, activityId, count, duration });
      res.send({
        routineId: routineId,
        activityId: activityId,
        count: count,
        duration: duration
      })
    }
  } catch ({name, message}) {
    next({name, message})
  }
})

module.exports = routinesRouter;
