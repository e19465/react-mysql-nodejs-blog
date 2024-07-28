const { connection } = require("../db");
const {
  hashPassword,
  comparePassword,
} = require("../helpers/passwordHashCompare");

const userController = {
  //! Function to fetch all users
  listUsers: (req, res) => {
    const getAllUsersQuery =
      "SELECT id, username, email, img_url, created_at FROM users";
    connection.query(getAllUsersQuery, (err, users) => {
      if (err) {
        console.error("Error fetching users:", err.stack);
        res.status(500).json({ error: "Failed to fetch users" });
        return;
      }
      res.json(users); // Return JSON response
    });
  },

  //! Function to fetch a single user
  getUser: (req, res) => {
    const userId = req.params.id;
    const getUserQuery =
      "SELECT id, username, email, img_url, created_at FROM users WHERE id = ?";
    connection.query(getUserQuery, [userId], (err, user) => {
      if (err) {
        console.error("Error fetching user:", err.stack);
        res.status(500).json({ error: "Failed to fetch user" });
        return;
      }
      if (user.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user[0]); // Return JSON response
    });
  },

  //! Function to create a new user
  createUser: async (req, res) => {
    const userData = req.body;

    try {
      //* CHECK FOR EXISTING USER BY EMAIL
      const existingUserFindQuery = "SELECT * FROM users WHERE email = ?";
      connection.query(
        existingUserFindQuery,
        [userData.email],
        (err, results) => {
          if (err) throw err;
          if (results.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
          }

          //* CHECK FOR EXISTING USER BY USERNAME
          const existingUserFindQuery2 =
            "SELECT * FROM users WHERE username = ?";
          connection.query(
            existingUserFindQuery2,
            [userData.username],
            async (err, results) => {
              if (err) throw err;
              if (results.length > 0) {
                return res
                  .status(400)
                  .json({ error: "Username already exists" });
              }

              //* IF NO EXISTING USER, CREATE NEW USER
              const hashedPassword = await hashPassword(userData.password);
              const createUserQuery =
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
              connection.query(
                createUserQuery,
                [userData.username, userData.email, hashedPassword],
                (err) => {
                  if (err) throw err;
                  return res
                    .status(201)
                    .json({ message: "User created successfully" });
                }
              );
            }
          );
        }
      );
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Failed to create user", errorStack: err });
    }
  },

  //! Function to update user details
  updateUserDetails: (req, res) => {
    const userId = req.params.id;
    const updatedData = req.body;

    // FIND USER BY ID
    const findUserQuery = "SELECT * FROM users WHERE id = ?";
    connection.query(findUserQuery, [userId], (err, user) => {
      if (err) {
        console.error("Error fetching user:", err.stack);
        return res.status(500).json({ error: "Failed to fetch user" });
      }
      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      // UPDATE USER DETAILS
      const updateUserQuery = "UPDATE users SET ? WHERE id = ?";
      connection.query(
        updateUserQuery,
        [updatedData, userId],
        (err, result) => {
          if (err) {
            console.error("Error updating user:", err.stack);
            return res.status(500).json({ error: "Failed to update user" });
          }
          if (result.affectedRows > 0) {
            return res.json({ message: "User details updated successfully" });
          } else {
            return res.status(500).json({ error: "update failed" });
          }
        }
      );
    });
  },

  updateUserPassword: async (req, res) => {
    const userId = req.params.id;
    const { current_password, new_password, confirm_new_password } = req.body;

    // FIND USER BY ID
    const findUserQuery = "SELECT * FROM users WHERE id = ?";
    connection.query(findUserQuery, [userId], async (err, user) => {
      if (err) {
        console.error("Error fetching user:", err.stack);
        return res.status(500).json({ error: "Failed to fetch user" });
      }
      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // COMPARE PASSWORD
      const isPasswordValid = await comparePassword(
        current_password,
        user[0].password
      );
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Current password is invalid" });
      }

      if (new_password !== confirm_new_password) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      // UPDATE USER PASSWORD
      const updatePasswordQuery = "UPDATE users SET password = ? WHERE id = ?";
      const hashedPassword = await hashPassword(new_password);
      connection.query(
        updatePasswordQuery,
        [hashedPassword, userId],
        (err, result) => {
          if (err) {
            console.error("Error updating password:", err.stack);
            return res.status(500).json({ error: "Failed to update password" });
          }
          if (result.affectedRows > 0) {
            return res.json({ message: "Password updated successfully" });
          } else {
            return res.status(500).json({ error: "update failed" });
          }
        }
      );
    });
  },

  deleteUser: (req, res) => {
    const userId = req.params.id;
    const password = req.body.password;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // FIND USER BY ID
    const findUserQuery = "SELECT * FROM users WHERE id = ?";
    connection.query(findUserQuery, [userId], async (err, user) => {
      if (err) {
        console.error("Error fetching user:", err.stack);
        return res.status(500).json({ error: "Failed to fetch user" });
      }
      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // COMPARE PASSWORD
      const isPasswordValid = await comparePassword(password, user[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password" });
      }

      // DELETE USER
      const deleteUserQuery = "DELETE FROM users WHERE id = ?";
      connection.query(deleteUserQuery, [userId], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Failed to delete user", errorStack: err });
        }
        if (result.affectedRows > 0) {
          return res.sendStatus(204);
        } else {
          return res.status(500).json({ error: "delete failed" });
        }
      });
    });
  },
};

module.exports = userController;
