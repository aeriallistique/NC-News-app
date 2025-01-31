const usersRouter = require('express').Router();
const controller = require('../controller/controller');

usersRouter.get("/", controller.getUsers);
usersRouter.get('/:username', controller.getUserByUsername);

module.exports = usersRouter;