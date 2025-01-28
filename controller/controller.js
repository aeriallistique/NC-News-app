const articles = require('../db/data/test-data/articles');
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

module.exports.getAllArticles = (req, res, next) => {
  model.fetchAllArticles().then((response) => {
    res.status(200).send(response);
  })
    .catch((err) => {
      next(err);
    });
};

module.exports.getCommentsByArticleId = (req, res, next) => {
  const article_id = req.params.article_id;

  model.fetchAllCommentsByArticleId(article_id).then((response) => {
    res.status(200).send({ comments: response });
  }).catch((err) => [
    next(err)
  ]);
};