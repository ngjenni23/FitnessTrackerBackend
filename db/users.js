const client = require("./client");
const {hash, compare} = require('bcrypt');

// database functions

// user functions
async function createUser({ username, password }) {
  try{
    console.log("Adding new user...");
    const hashedPass = await hash(password, 10);
    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [username, hashedPass]);

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
    const user = await getUserByUsername(username);
    const hashedPass = user.password;
    const match = await compare(password, hashedPass);

    if (match) {
      delete user.password;
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
    const { rows: [ user ] } = await client.query(`
      SELECT * 
      FROM users
      WHERE id = $1;
    `, [userId]);

    delete user.password;

    console.log("Finsihed finding user!")
    return user;
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
      WHERE username = $1;
    `, [userName])

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
