const mysql = require("mysql2");
const {
  createPostsTableQuery,
  createUsersTableQuery,
} = require("./db_table_query");
const dotenv = require("dotenv");

//! Load environment variables
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
});

function initializeDatabase() {
  connection.query(createUsersTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating users table:", err.stack);
      return;
    }
    console.log("Users table created successfully");
  });

  connection.query(createPostsTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating posts table:", err.stack);
      return;
    }
    console.log("Posts table created successfully");
  });
}

module.exports = {
  connection,
  initializeDatabase,
};
