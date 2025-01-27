const db = require('../db/connection');

module.exports.fetchTopics = (query) => {
  let SQLString = "SELECT * FROM topics";
  return db.query(SQLString).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ message: 'Topics not found!' });
    } else {
      return rows;
    }

  });

};