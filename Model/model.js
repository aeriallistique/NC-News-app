const db = require('../db/connection');

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
    console.log(`inside model`, response);

    if (response.rows.length === 0) {
      return Promise.reject({ message: "Article not found", code: 404 });
    } else {
      return response.rows;
    }
  });
};