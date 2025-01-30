const usersRouter = require('express').Router();
const controller = require('../controller/controller');

usersRouter.get("/", controller.getUsers);

usersRouter.get("/:id", (req, res) => {
  res.status(200).send('All OK from /api/users/:id');
});

module.exports = usersRouter;