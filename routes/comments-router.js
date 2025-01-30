const commentsRouter = require('express').Router();
const controller = require('../controller/controller');

commentsRouter.delete('/:comment_id', controller.deleteCommentById);

module.exports = commentsRouter;