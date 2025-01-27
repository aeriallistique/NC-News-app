const express = require('express');
const app = express();
const endpoints = require('./endpoints.json');
const Controller = require('./controller/controller');

app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});

app.get('/api/topics', Controller.getTopics);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: " Internal server error" });

});

module.exports = app;