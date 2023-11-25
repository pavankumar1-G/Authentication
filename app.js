// write API's to perform operations on the table user in database table:

// Import third-party packages in this file:

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");

// Initializing Database and Server:
let DB = null;
const initializingDBAndServer = async () => {
  try {
    DB = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at http;//localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializingDBAndServer();

//API-1:
// create user details in user table using POST Method:

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserWithSqlQuery = `
    SELECT *
    FROM 
    user
    WHERE
    username = "${username}";
    `;
  const user = await DB.get(selectUserWithSqlQuery);
  if (user === undefined) {
    // create user in user table:
    const createUserWithSqlQuery = `
        INSERT INTO user(username, name, password, gender, location)
        VALUES(
            "${username}",
            "${name}",
            "${hashedPassword}",
            "${gender}",
            "${location}");
        `;
    if (password.length < 5) {
      //Scenario-2:
      response.status(400);
      response.send("Password is too short");
    } else {
      //Scenario-3:
      await DB.get(createUserWithSqlQuery);
      response.send("User created successfully");
    }
  } else {
    //Scenario-1:
    //send user already exists in the user table:
    response.status(400);
    response.send("User already exists");
  }
});

//user Login API using POST Method for send credentials through request body:

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  const selectUserWithSqlQuery = `
    SELECT *
    FROM
    user
    WHERE
    username = "${username}";
    `;
  const user = await DB.get(selectUserWithSqlQuery);
  if (user === undefined) {
    //Scenario-1:
    // if If an unregistered user tries to login:
    response.status(400);
    response.send("Invalid user");
  } else {
    //compare password, hashedPassword:
    isPasswordMatched = await bcrypt.compare(password, user.password);
    if (isPasswordMatched === true) {
      //Scenario-3:
      response.send("Login success!");
    } else {
      //Scenario-2:
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// update password using network call With PUT Method:
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const selectUserWithSqlQuery = `
    SELECT *
    FROM
    user
    WHERE
    username = "${username}"
    `;
  const user = await DB.get(selectUserWithSqlQuery);
  if (user === undefined) {
    //user not in user table( unregistrant):
    response.status(400);
    response.send("User not registered");
  } else {
    //checking password:
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (isValidPassword === true) {
      //check length Of password:
      if (newPassword.length < 5) {
        //Scenario-2:
        response.status(400);
        response.send("Password is too short");
      } else {
        //Scenario-3:
        //Update password:
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updateOldPasswordWithSqlQuery = `
                UPDATE user
                SET
                password = "${encryptedPassword}"
                WHERE
                username = "${username}"
                `;
        await DB.run(updateOldPasswordWithSqlQuery);
        response.send("Password updated");
      }
    } else {
      //Scenario-1:
      //Send Invalid current password:
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
