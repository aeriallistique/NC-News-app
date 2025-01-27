const Model = require('../Model/model');

module.exports.getTopics = (req, res, next) => {
  Model.fetchTopics().then((result) => {
    res.status(200).send({ topics: result });
  })
    .catch((err) => {
      next(err);
    });

};