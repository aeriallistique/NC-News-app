const format = require('pg-format');
const db = require('../db/connection');
const { checkArticleExists, checkUserExists } = require('../db/seeds/utils');

module.exports.fetchTopics = () => {
  let sqlString = "SELECT * FROM topics";
  return db.query(sqlString).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ message: 'Topics not found!' });
    } else {
      return rows;
    }
  });
};

module.exports.fetchArticleById = (id) => {
  if (isNaN(id)) { return Promise.reject({ message: 'Not a valid id', code: 400 }); }
  let sqlString = format(`SELECT * FROM articles WHERE article_id= %L`, id);
  return db.query(sqlString)
    .then((response) => {
      if (!response.rows.length) {
        return Promise.reject({ message: "Article not found", code: 404 });
      } else {
        return response.rows;
      }
    });
};

module.exports.fetchAllArticles = () => {
  let sqlString = "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id=comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC";

  return db.query(sqlString).then((response) => {
    if (response.rowCount === 0) {
      return Promise.reject({ message: "No articles found." });
    } else { return response.rows; }
  });
};

module.exports.fetchAllCommentsByArticleId = (id) => {
  return this.fetchArticleById(id)
    .then((resp) => {
      return db.query(`SELECT * FROM comments WHERE article_id= $1 ORDER BY created_at DESC`, [id]).then((response) => {
        return response.rows;
      });
    });
};

module.exports.createComment = (query) => {
  const { id, username, body } = query;
  if (!id || !username || !body) { return Promise.reject({ message: "Missing fields in the request body", code: 400 }); }

  return checkArticleExists(id)
    .then(() => {
      return checkUserExists(username);
    }).then(() => {
      let sqlString = "INSERT INTO comments(article_id, author, body) VALUES($1, $2, $3) RETURNING *;";
      const values = [id, username, body];
      return db.query(sqlString, values).then((response) => {
        return response.rows[0];
      });
    });
};