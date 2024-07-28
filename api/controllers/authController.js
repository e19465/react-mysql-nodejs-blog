const { comparePassword } = require("../helpers/passwordHashCompare");
const { connection } = require("../db");
const {
  get_access_token,
  get_refresh_token,
} = require("../helpers/jsonWebTokens");

const authController = {
  login: (req, res) => {
    const findUserQuery = "SELECT * FROM users WHERE username = ?";
    const userSendingPassword = req.body.password;
    const userSendingUsername = req.body.username;

    if (!userSendingPassword || !userSendingUsername) {
      return res.status(400).json({ error: "username and password required" });
    }

    // find the user by username
    connection.query(
      findUserQuery,
      [userSendingUsername],
      async (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
          return res.status(400).json({ error: "Invalid Credentials" });
        }
        const user = result[0];
        // compare passwords
        const isPasswordValid = await comparePassword(
          userSendingPassword,
          user.password
        );

        if (!isPasswordValid) {
          return res.status(400).json({ error: "Invalid Credentials" });
        }

        // obtaining jwt
        const accessToken = get_access_token(
          user.id,
          user.username,
          user.email
        );
        const refreshToken = get_refresh_token(
          user.id,
          user.username,
          user.email
        );

        // set HTTP-only cookies
        res.cookie("access", accessToken, {
          httpOnly: true,
          secure: true,
          samesite: "Lax",
        });
        res.cookie("refresh", refreshToken, {
          httpOnly: true,
          secure: true,
          samesite: "Lax",
        });

        // other user data without password
        const { password, ...others } = user;
        return res.status(200).json(others);
      }
    );
  },

  logout: (req, res) => {
    res.clearCookie("access", { samesite: "none", secure: true });
    res.clearCookie("refresh", { samesite: "none", secure: true });
    res.sendStatus(200);
  },

  refreshTokens: (req, res) => {
    const user = req.user;
    if (!user) {
      return res
        .status(400)
        .json({ error: "User details required to update tokens" });
    }

    // obtaining jwt
    const accessToken = get_access_token(user.id, user.username, user.email);
    const refreshToken = get_refresh_token(user.id, user.username, user.email);

    // set HTTP-only cookies
    res.cookie("access", accessToken, { httpOnly: true, secure: true });
    res.cookie("refresh", refreshToken, { httpOnly: true, secure: true });

    return res.sendStatus(200);
  },
};

module.exports = authController;
