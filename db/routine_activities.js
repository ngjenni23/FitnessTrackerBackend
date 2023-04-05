const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    console.log("Adding activity to routine...");
    const { rows: [ routineActivity ] } = await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [routineId, activityId, count, duration]);

    console.log("Finsihed adding activity to routine!");
    return routineActivity;
  } catch (error) {
    console.log("Error adding activity to routine");
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try{
    console.log("Finding routine activity by id...");
    const { rows: [ routineActivity ] } = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE id = $1;
    `, [id]);

    console.log("Finished finding routine activity by id!");
    return routineActivity;
  } catch (error){
      console.log("Erorr finding routine activity by id")
      throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    console.log("FInding routine activities by routine...");
    const { rows: routineActivity } = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE "routineId" = $1;
    `, [id]);

    console.log("Finsihed finding routine activities by routine!");
    return routineActivity;
  } catch (error) {
    console.log("Error finding routine activities by routine");
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
    console.log("Updating routine activity...");
    const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${index+1}`
    ).join(', ');

    if (setString.length === 0) {
      return;
    }

  try {
    const { rows: [ routineActivity ] } = await client.query(`
      UPDATE routine_activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields));

    console.log("Finished updating routine activity!");
    return routineActivity;
  } catch (error) {
    console.log("Error updating routine activity");
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try{
    console.log("Deleting routine activity...");
    const { rows: [ deletedRoutine ] } = await client.query(`
      DELETE FROM routine_activities
      WHERE id = $1
      RETURNING *;
    `,[id]);

    console.log("Finsihed deleting routine activity!");
    return deletedRoutine;
  } catch (error) {
    console.log("Error deleting routine activity");
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try{
    const { rows } = await client.query(`
      SELECT *
      FROM routine_activities
      JOIN routines
      ON routine_activities."routineId" = routines.id
      WHERE routine_activities.id = $1
      AND "creatorId" = $2;
    `, [routineActivityId, userId]);
    return rows.length > 0;
  } catch (error) {
    console.log("Error");
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
