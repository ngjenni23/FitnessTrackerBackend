const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  try {
    //console.log("Creating activity...");
    const { rows: [ activity ] } = await client.query(`
      INSERT INTO activities(name, description)
      VALUES ($1, $2)
      RETURNING *;
    `, [name.charAt(0).toUpperCase()+name.slice(1), description]);
    // return the new activity

    console.log("Finished creating activity!");
    return activity;
  } catch (error) {
      console.log("Error creating activity");
      throw error;
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    console.log("Finding ALL activities...");
    const { rows } = await client.query(`
      SELECT *
      FROM activities;
    `);

    console.log("Finished finding all activities!")
    return rows;
  } catch (error) {
      console.log("Error finding all actvities")
  }
}

async function getActivityById(id) {
  try {
    console.log("Finding activities by id...");
    const { rows: [ activity ] } = await client.query(`
      SELECT * 
      FROM activities
      WHERE id = $1;
    `, [id]);

    console.log("Finsihed finding activies!");
    return activity;
  } catch (error) {
    console.log("Error finding activities");
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    console.log("Finding acitvities by name...");
    const { rows: [ activity ] } = await client.query(`
      SELECT *
      FROM activities
      WHERE name = $1;
    `, [name]);

    console.log("Finsihed finding activities by name!");
    return activity;
  } catch (error) {
    console.log("Error finding acitvities by name");
    throw error;
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  const routinesById = [...routines];
  const paramList = routines.map ((r, idx) => `$${idx+1}`).join(', ')
  const routineList = routines.map (routine => routine.id)
  if (!routineList?.length) return []
 
    try {
      const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${paramList})
      `,routineList)
      for (const routine of routinesById){
        const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
        routine.activities = activitiesToAdd;
      }
      return routinesById;
    } catch(error){
      console.log("")
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  console.log("Updating activity...");
    const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${index+1}`
    ).join(', ');

    if (setString.length === 0) {
      return;
    }

  try {
    const { rows: [ updatedActivity ] } = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields));

    console.log("Finished updating activity!");
    return updatedActivity;
  } catch (error) {
    console.log("Error updating activity");
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
