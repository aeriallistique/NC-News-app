const apiRouter = require('express').Router();
const usersRouter = require('./users-router');
const articlesRouter = require('../routes/articles-router');
const topicsRouter = require('./topics-router');
const commentsRouter = require('../routes/comments-router');
const endpoints = require('../endpoints.json');


apiRouter.get("/", (req, res) => {
  res.status(200).send({ endpoints });
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/comments', commentsRouter);


module.exports = apiRouter;