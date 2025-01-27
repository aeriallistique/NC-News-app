const express = require('express');
const app = express();
const endpoints = require('./endpoints.json');

app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});

app.use((err, req, res, next) => {
  console.log(err);

});

module.exports = app;