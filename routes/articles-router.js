const articlesRouter = require('express').Router();
const controller = require('../controller/controller');

articlesRouter.get('/', controller.getAllArticles);
articlesRouter.get('/:article_id', controller.getArticleById);
articlesRouter.get('/:article_id/comments', controller.getCommentsByArticleId);
articlesRouter.post('/', controller.postArticle);
articlesRouter.post('/:article_id/comments', controller.postCommentForArticle);
articlesRouter.patch('/:article_id', controller.updateArticleVote);

module.exports = articlesRouter;