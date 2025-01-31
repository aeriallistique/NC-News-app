const commentsRouter = require('express').Router();
const controller = require('../controller/controller');

commentsRouter.delete('/:comment_id', controller.deleteCommentById);
commentsRouter.patch('/:comment_id', controller.updateCommentById);

module.exports = commentsRouter;