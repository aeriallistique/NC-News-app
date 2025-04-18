
const { all } = require('../app');
const db = require('../db/connection');
const { checkArticleExists, checkUserExists, checkCommentExists, sanitizeQUeryObject, isQueryValid, isPostObjectValid } = require('../db/seeds/utils');


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

  let sqlString = `SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id=comments.article_id WHERE articles.article_id= $1 GROUP BY articles.article_id;`;
  return db.query(sqlString, [id])
    .then((response) => {
      if (!response.rows.length) {
        return Promise.reject({ message: "Article not found", code: 404 });
      } else {
        return response.rows;
      }
    });
};


module.exports.fetchAllArticles = (query) => {
  const queryObject = sanitizeQUeryObject(query);

  if (Object.entries(queryObject).length === 0) {
    return Promise.reject({ message: 'Prohibited query parameter', code: 400 });
  }

  let sqlString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id=comments.article_id`;

  let queryParams = [];
  if (queryObject.topic) {
    queryParams.push(queryObject.topic);
    sqlString += ` WHERE articles.topic= $${queryParams.length}`;
  }
  sqlString += ` GROUP BY articles.article_id ORDER BY ${queryObject.sort_by} ${queryObject.order}`;

  if (queryObject.limit) {
    queryParams.push(queryObject.limit);
    sqlString += ` LIMIT $${queryParams.length};`;

  }


  return db.query(sqlString, queryParams).then((response) => {
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

module.exports.updateArticleVote = (query) => {
  const { id, inc_votes } = query;
  if (!id || !inc_votes || typeof inc_votes !== 'number') {
    return Promise.reject({ message: "Missing fields in the request body", code: 400 });
  }
  return checkArticleExists(id)
    .then(() => {
      return db.query("UPDATE articles SET votes = votes+ $1 WHERE article_id=$2 RETURNING *;", [inc_votes, id]);
    }).then((response) => {
      return response.rows[0];
    });
};

module.exports.deleteCommentById = (id) => {
  //check comment exists, the utility function will handle any non number id's
  return checkCommentExists(id)
    .then(() => { //if exists perform db query
      return db.query("DELETE FROM comments WHERE comment_id= $1", [id]);
    }).then(() => {
      return;
    });
};

module.exports.fetchAllUsers = () => {
  return db.query("SELECT * FROM users")
    .then((response) => {
      return response.rows;
    });
};

module.exports.fetchUserByUsername = async (username) => {
  if (isNaN(username)) {
    const { rows: users, rowCount } = await db.query("SELECT * FROM users WHERE users.username= $1", [username]);
    if (rowCount === 0) {
      return Promise.reject({ message: 'User not found', code: 404 });
    } else { return users[0]; }
  } else {
    return Promise.reject({ message: 'Invalid username parameter', code: 400 });
  }

};

module.exports.updateCommentById = async (query) => {
  if (isQueryValid(query)) {
    const values = [query.inc_votes, query.comment_id];
    const { rows, rowCount } = await db.query("UPDATE comments SET votes= votes+ $1 WHERE comments.comment_id=$2 RETURNING *", values);
    if (rowCount === 0) { return Promise.reject({ message: 'No comment found', code: 404 }); }
    return rows[0];
  } else {
    return Promise.reject({ message: 'Invalid request body', code: 400 });
  }
};

module.exports.createArticle = async (query) => {


  const validQuery = await isPostObjectValid(query);
  if (validQuery === true) {
    const values = [query.author, query.title, query.topic, query.body, query.article_img_url || null];
    const newArticle = await db.query("INSERT INTO articles (author, title, topic, body, article_img_url) VALUES($1, $2, $3, $4, COALESCE($5, 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700')) RETURNING *, 0 AS comment_count", values);

    return newArticle.rows[0];
  } else {
    return Promise.reject(validQuery);
  }
};