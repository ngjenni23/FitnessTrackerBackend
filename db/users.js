const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try{
    console.log("Adding new user...");
    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [username, password]);

    delete user.password;
    console.log("Finished creating new user!");
    return user;
  } catch (error) {
    console.log("Error creating new user");
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    console.log('Finding user...')
    const { rows: [ user ] } = await client.query(`
    SELECT *
    FROM users
    WHERE username=$1;
    `, [username]);

    if (password !== user.password) {
      console.log('Error finding user');
      return null;
    } else {
        delete user.password;
        console.log('Finished finding user!')
        return user;
    }
  } catch (error) {
    console.log('Error finding user');
    throw error;
  }
}

async function getUserById(userId) {
  try {
    console.log("Finding user by id...")
    const { rows } = await client.query(`
      SELECT * 
      FROM users
      WHERE id=$1;
    `, [userId]);

    delete rows[0].password;

    console.log("Finsihed finding user!")
    return rows[0];
  } catch(error) {
      console.log("Error finding user");
      throw error;
  }
}

async function getUserByUsername(userName) {
  try {
    console.log("Finding user by username...")
    const { rows: [ user ] } = await client.query(`
      SELECT *
      FROM users
      WHERE users=$1;
    `, [userName])

    delete user.password;
    console.log("Finsihed finding user!");
    return user;
  } catch (error) {
    console.log("Error finding user");
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
