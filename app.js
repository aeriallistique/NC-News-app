const express = require('express');
const app = express();
const endpoints = require('./endpoints.json');
const controller = require('./controller/controller');

app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});

app.get('/api/topics', controller.getTopics);
app.get('/api/articles', controller.getAllArticles);
app.get("/api/articles/:article_id", controller.getArticleById);
app.get('/api/articles/:article_id/comments', controller.getCommentsByArticleId);

app.post('/api/articles/:article_id/comments', controller.postCommentForArticle);

app.patch('/api/articles/:article_id', controller.updateArticleVote);

app.use((err, req, res, next) => {
  if (err.message && err.code) {
    res.status(err.code).send({ error: err.message, code: err.code });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({ error: 'Bad request.' });
  }
});

app.use((err, req, res, next) => {
  console.log(`what's this err>>>`, err);

  res.status(500).send({ msg: " Internal server error" });
});

module.exports = app;