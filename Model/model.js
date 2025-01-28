const { response } = require('../app');
const db = require('../db/connection');
const checkArticleIdExists = require('../db/seeds/utils');

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
  const article_id = id;

  //i'm sure i need to add some conditional logic in here to sanitize the id but i'm not completely sure how that would be best done.
  let sqlString = `SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles JOIN topics ON articles.topic=topics.slug JOIN users ON articles.author=users.username WHERE articles.article_id='${article_id}'`;

  return db.query(sqlString).then((response) => {

    if (response.rowCount === 0) {
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
    } else {
      return response.rows;
    }
  });
};

module.exports.fetchAllCommentsByArticleId = (id) => {
  const articleId = Number(id);
  const values = [articleId];
  //grabbing all the comments and checking if there are any comments with articleID
  return db.query("SELECT article_id FROM comments").then((response) => {
    const isCommentId = response.rows.some(comment => comment.article_id === articleId);
    if (!isCommentId) { //no comments with articleID have been found
      return Promise.reject({ message: 'No comment with article_id found', code: 404 });

    } else { //if there are any comments with articleID then perform query to get all comments with that id
      const values = [articleId];
      return db.query(`SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE comments.article_id= $1 ORDER BY comments.created_at DESC`, values).then((response) => { return response.rows; });
    }
  });
  // I am aware this is not the most efficient way to do this but I am getting a hang test whenever I use the second sql string and for the last 18 hours I have not been able to find the issue with it.
};