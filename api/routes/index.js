const authRouter = require("./auth");
const usersRouter = require("./user");
const postsRouter = require("./posts");

const routes = {
  authRouter,
  usersRouter,
  postsRouter,
};

module.exports = routes;
