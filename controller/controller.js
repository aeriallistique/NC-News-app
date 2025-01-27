const model = require('../Model/model');

module.exports.getTopics = (req, res, next) => {
  model.fetchTopics().then((result) => {
    res.status(200).send({ topics: result });
  })
    .catch((err) => {
      next(err);
    });
};

module.exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  model.fetchArticleById(article_id).then((response) => {
    res.status(200).send({ article: response[0] });
  }).catch((err) => {
    next(err);
  });

};