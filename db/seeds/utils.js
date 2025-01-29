const db = require('../connection.js');


exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

exports.checkArticleExists = (id) => {
  if (isNaN(id)) { return Promise.reject({ message: 'Not a valid id', code: 400 }); }
  return db.query("SELECT * FROM articles WHERE article_id= $1", [id])
    .then((response) => {
      if (response.rows.length === 0) {
        return Promise.reject({ message: 'Article not found', code: 404 });
      } else { return; }
    });
};

exports.checkUserExists = (user) => {
  if (typeof user !== 'string') { return Promise.reject({ message: 'Not a valid user input', code: 400 }); }
  return db
    .query("SELECT * FROM users WHERE username= $1", [user])
    .then((response) => {
      if (response.rows.length === 0) {
        return Promise.reject({ message: 'User not found', code: 404 });
      } else { return; }
    });
};