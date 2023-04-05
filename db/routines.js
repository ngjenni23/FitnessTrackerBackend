const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    console.log("Creating routine...")
    const { rows: [ routine ] } = await client.query(`
      INSERT INTO routines("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    console.log("Finsihed creating routine!")
    return routine;
  } catch (error) {
    console.log("Error creating routine");
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: routine } = await client.query(`
      SELECT * 
      FROM routines
      WHERE id = $1
    `, [id]);

    console.log("Finsihed finding routine by id!");
    return routine;
  } catch (error) {
    console.log("Error finding routine by id");
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    console.log("Finding routines without activites...")
    const { rows } = await client.query(`
      SELECT *
      FROM routines
      LEFT JOIN routine_activities
      ON routines.id = routine_activities."routineId"
      WHERE routine_activities."activityId" IS NULL;
    `);

    console.log("Finished finding routines without activities!");
    return rows;
  } catch (error) {
    console.log("Error finding routines without activities");
    throw error;
  }
}

async function getAllRoutines() {
  try {
    console.log("Finding ALL routines...")
    const { rows: [...routines ] } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users
      ON routines."creatorId" = users.id;
    `);

    console.log("Finished finding all routines");
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log("Error finding all routines");
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    console.log("Finding ALL public routines...")
    const { rows: [...routines] } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users
      ON routines."creatorId" = users.id
      WHERE "isPublic"= true;
    `);

    console.log("Finished finding all public routines");
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log("Error finding public routines");
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    console.log("Finding ALL routines by user...")
    const { rows: [...routines ] } = await client.query(`
      SELECT routine.*, users.username AS "creatorName"
      FROM routines AS routine
      JOIN users 
      ON routine."creatorId" = users.id
      WHERE users.username = $1;
    `, [username]);

    console.log("Finished finding routines by user!");
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log("Error finding routines by user");
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    console.log("Finding public routines by user...")
    const { rows: [...routines] } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users
      ON routines."creatorId" = users.id
      WHERE "isPublic" = true
      AND users.username = $1 
    `, [username]);
    
    console.log("Finished finding public routines by user!");
    return attachActivitiesToRoutines(routines) ;
  } catch (error) {
    console.log("Error finding public routines by user");
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    console.log("Finding public routines by activity...")
    const { rows: [...routine] } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN routine_activities
      ON routines.id = routine_activities."routineId"
      JOIN users
      ON routines."creatorId" = users.id
      WHERE "isPublic" = true
      AND "activityId" = $1;
    `, [id]);
    
    console.log("Finished finding public routines by activity!");
    return attachActivitiesToRoutines(routine);
  } catch (error) {
    console.log("Error finding public routines by activity");
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  console.log("Updating routines...");
    const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${index+1}`
    ).join(', ');

    if (setString.length === 0) {
      return;
    }

  try {
    const { rows: [ updatedRoutine ] } = await client.query(`
      UPDATE routines
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields));

    console.log("Finished updating routines!");
    return updatedRoutine;
  } catch (error) {
    console.log("Error updating routiens");
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    console.log("Deleteing routine...")

    await client.query(`
    DELETE FROM routine_activities
    WHERE "routineId" = $1
    `, [id]);

    const { rows: deletedRoutine } = await client.query(`
      DELETE FROM routines
      WHERE id = $1
      RETURNING *;
    `, [id]);

    console.log("Finished deletign routine!");
    return deletedRoutine;
  } catch (error) {
    console.log("Error deleting routine");
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
