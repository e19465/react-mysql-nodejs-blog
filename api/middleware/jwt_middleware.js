const jwt = require("jsonwebtoken");

const verify_access_token = (req, res, next) => {
  const accessToken = req.cookies.access;
  if (accessToken) {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(403).json({ error: "Access token has expired" });
        } else {
          return res.status(403).json({ error: "Invalid access token" });
        }
      }
      req.user = payload;
      next();
    });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

const verify_access_token_and_paramsId_with_tokenId = (req, res, next) => {
  verify_access_token(req, res, () => {
    if (req.params.id) {
      if (String(req.user.user_id) === String(req.params.id)) {
        next();
      } else {
        return res.status(403).json({ error: "Unauthorized" });
      }
    } else {
      return res.status(400).json({ error: "Account id is required" });
    }
  });
};

const verify_refresh_token = (req, res, next) => {
  const refreshToken = req.cookies.refresh;
  if (refreshToken) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          if (err instanceof jwt.TokenExpiredError) {
            return res.status(403).json({ error: "Refresh token has expired" });
          } else {
            return res.status(403).json({ error: "Invalid refresh token" });
          }
        }
        req.user = payload;
        next();
      }
    );
  } else {
    return res.status(401).json({ error: "Refresh token required" });
  }
};

module.exports = {
  verify_access_token,
  verify_refresh_token,
  verify_access_token_and_paramsId_with_tokenId,
};
