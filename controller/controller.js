const { response } = require('express');
const model = require('../Model/model');
const { sort } = require('../db/data/test-data/users');

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
  model.fetchAllArticles(req.query).then((response) => {
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

module.exports.postCommentForArticle = (req, res, next) => {
  const id = req.params.article_id;
  const { username, body } = req.body;
  model.createComment({ id, username, body }).then((response) => {
    res.status(201).send({ comment: response });
  }).catch((err) => {
    next(err);
  });
};

module.exports.updateArticleVote = (req, res, next) => {
  const { inc_votes } = req.body;
  const id = req.params.article_id;
  model.updateArticleVote({ id, inc_votes })
    .then((response) => {
      res.status(201).send({ article: response });
    }).catch((err) => next(err));
};

module.exports.deleteCommentById = (req, res, next) => {
  const id = req.params.comment_id;

  model.deleteCommentById(id)
    .then((response) => {
      res.status(204).send(response);
    }).catch((err) => {
      next(err);
    });
};

module.exports.getUsers = (req, res, next) => {
  model.fetchAllUsers()
    .then((response) => {
      res.status(200).send(response);
    }).catch((err) =>
      next(err)
    );
};

module.exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await model.fetchUserByUsername(username);
    res.status(200).send({ user: user });
  } catch (error) {
    next(error);
  }
};

module.exports.updateCommentById = async (req, res, next) => {
  try {
    const { inc_votes } = req.body;
    const { comment_id } = req.params;
    const updatedComment = await model.updateCommentById({ inc_votes, comment_id });
    res.status(201).send({ comment: updatedComment });
  } catch (error) {
    next(error);
  }
};

module.exports.postArticle = async (req, res, next) => {
  try {
    const newArticle = await model.createArticle(req.body);
    res.status(201).send({ article: newArticle });
  } catch (error) {
    next(error);
  }
};