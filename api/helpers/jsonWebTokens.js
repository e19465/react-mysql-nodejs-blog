const jwt = require("jsonwebtoken");

const get_access_token = (user_id, username, email) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);
  const expirationTime = timestamp + 60 * 5; // expires in 5 minutes
  const payload = {
    user_id: user_id,
    username: username,
    email: email,
    timestamp: timestamp,
    exp: expirationTime,
  };
  const token = jwt.sign(payload, accessTokenSecret);
  return token;
};

const get_refresh_token = (user_id, username, email) => {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);
  const expirationTime = timestamp + 60 * 60 * 24 * 7; // expires in week
  const payload = {
    user_id: user_id,
    username: username,
    email: email,
    timestamp: timestamp,
    exp: expirationTime,
  };
  const token = jwt.sign(payload, refreshTokenSecret);
  return token;
};

module.exports = { get_access_token, get_refresh_token };
