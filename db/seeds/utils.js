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

exports.checkCommentExists = (id) => {
  if (isNaN(id)) { { return Promise.reject({ message: 'Not a valid id', code: 400 }); } }
  return db
    .query("SELECT * FROM comments WHERE comment_id= $1", [id])
    .then((response) => {
      if (response.rows.length === 0) {
        return Promise.reject({ message: 'Comment not found', code: 404 });
      } else { return; }
    });
};

exports.sanitizeQUeryObject = (query) => {
  const sanitizedQuery = {};
  let sort_by = query.sort_by || "created_at";
  let order = query.order || "DESC";
  let topic = query.topic || null;

  const allowedQueries = {
    sort_by: [
      'author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url'],
    order: [
      'ASC', 'DESC'],
    topic: ['mitch', 'cats', 'paper']
  };

  const isSort_by = allowedQueries.sort_by.includes(sort_by);
  const isOder = allowedQueries.order.includes(order);
  const isTopic = allowedQueries.topic.includes(topic);

  if (!isOder || !isSort_by) { return sanitizedQuery; }

  if (isSort_by) { sanitizedQuery.sort_by = sort_by; }
  if (isOder) { sanitizedQuery.order = order; }
  if (isTopic) { sanitizedQuery.topic = topic; }


  return sanitizedQuery;
};