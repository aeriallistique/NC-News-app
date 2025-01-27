const express = require('express');
const app = express();
const endpoints = require('./endpoints.json');
const controller = require('./controller/controller');

app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});

app.get('/api/topics', controller.getTopics);
app.get("/api/articles/:article_id", controller.getArticleById);


app.use((err, req, res, next) => {
  console.log(err, `INSIDE MIDDLEWARE`);
  if (err.message === "Article not found") {
    res.status(err.code).send({ error: err.message });
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
  res.status(500).send({ msg: " Internal server error" });
});

module.exports = app;