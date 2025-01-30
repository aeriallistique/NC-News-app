const topicsRouter = require('express').Router();
const controller = require('../controller/controller');


topicsRouter.get('/', controller.getTopics);

module.exports = topicsRouter;