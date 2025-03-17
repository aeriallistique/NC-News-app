const express = require('express');
const noSleep = require('./noSleep');
const app = express();
const apiRouter = require('./routes/api-router');
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.use("/api", apiRouter);



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

noSleep();

module.exports = app;