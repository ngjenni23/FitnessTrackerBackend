/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const { JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const { createUser, 
        getUserByUsername, 
        getUserById,
        getPublicRoutinesByUser, 
        getAllRoutinesByUser 
    } = require('../db');

// POST /api/users/register

usersRouter.post('/register', async(req, res, next) => {
    const { username, password } = req.body;
    const existingUsernames = await getUserByUsername(username);

    
    if (existingUsernames) {
        res.send({
        error: 'error',
        name: 'error',
        message: `User ${username} is already taken.`,
        })
    } 
   else if (!username || !password) {
        res.send({
            error: "error",
            name: "MissingCredentialError",
            message: "Missing username or password."
        })
        } else if (password.length < 8) {
            res.send({
                error: "error",
                name: "ShortPasswordError",
                message: "Password Too Short!"
            });
        } else {
    try{
        const user = await createUser({
            username,
            password
        });

        const token = jwt.sign({
            id: user.id,
            username
          }, JWT_SECRET, {
            expiresIn: '1w'
          });

        res.send({
          user: {
            id: user.id,
            username: username
            },
            message: "thank you for signing up",
            token: token,
        });
    
    } catch ({ name, message }) {
        next ({ name, message });
    }}
})


// POST /api/users/login

usersRouter.post('/login', async(req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }

    try {
        const user = await getUserByUsername(username);

        if (user.password) {
            const token = jwt.sign({
            id: user.id,
            username
          }, JWT_SECRET, {
            expiresIn: '1w'
          });

          jwt.verify(token, JWT_SECRET);
            res.send({
            message: "you're logged in!",
            token: token,
            user: {
                id: user.id,
                username: username
            }});
        }
    } catch ({ name, message }) {
        next ({ name, message });
    }
})

// GET /api/users/me

usersRouter.get('/me', async(req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({
            error: "error",
            name: "NotLoggedIn",
            message: "You must be logged in to perform this action"
        })
    } else {
        try{
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId= decoded.id;
            const user = await getUserById(userId);
            res.send({
                id: user.id,
                username: user.username
            })
        } catch ({ name, message }) {
            next ({ name, message })
        }
    }
})

// GET /api/users/:username/routines 

usersRouter.get('/:username/routines', async(req, res, next) => {
    const { username } = req.params;
    const authHeader = req.headers.authorization;
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user= decoded.username;

        if (user !== username ) {
            const publicRoutines = await getPublicRoutinesByUser({ username });
            res.send(publicRoutines);
        } else if (user == username ) {
            const allRoutines = await getAllRoutinesByUser({ username });
            res.send(allRoutines);
        }
    } catch ({ name, message }) {
        next ({ name, message });
    }
})

module.exports = usersRouter;
