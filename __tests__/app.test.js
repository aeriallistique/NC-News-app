const endpointsJson = require("../endpoints.json");
const request = require('supertest');
/* Set up your test imports here */
const db = require('../db/connection');
const app = require('../app');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => seed(data));
afterAll(() => {
  db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200 responds with and array of topic objects", () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then((response) => {
        const topics = response._body.topics;
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).not.toBe(0);
        topics.forEach(topic => {
          expect(topic.hasOwnProperty('slug')).toBe(true);
          expect(topic.hasOwnProperty('description')).toBe(true);
        });
      });
  });
});

describe("GET/api/articles/:article_id", () => {
  test('200 responds with an article object', () => {
    return request(app)
      .get('/api/articles/2')
      .expect(200)
      .then((response) => {
        const { article } = response._body;
        expect(typeof article).toBe('object');
        expect(Object.keys(article).length).not.toBe(0);
        expect(article.hasOwnProperty('author')).toBe(true);
        expect(article.hasOwnProperty('title')).toBe(true);
        expect(article.hasOwnProperty('body')).toBe(true);
        expect(article.hasOwnProperty('topic')).toBe(true);
        expect(article.hasOwnProperty('created_at')).toBe(true);
        expect(article.hasOwnProperty('votes')).toBe(true);
        expect(article.hasOwnProperty('article_img_url')).toBe(true);

      });
  });
  test('404 not found, responds with error message article not found', () => {
    return request(app)
      .get('/api/articles/3333')
      .expect(404)
      .then((response) => {
        expect(response._body.error).toBe('Article not found');
      });
  });

});
describe('404 not found', () => {
  test('400 bad request, responds with error message bad request', () => {
    return request(app)
      .get('/api/articles/Id3')
      .expect(400)
      .then((response) => {
        expect(response._body.error).toBe('Not a valid id');
      });
  });
});

describe("GET /api/articles", () => {
  test('200 responds with an articles array of objects with correct properties', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const articles = response._body;
        expect(articles.length).not.toBe(0);
        articles.forEach(article => {
          expect(typeof article).toBe('object');
          expect(article.hasOwnProperty('author')).toBe(true);
          expect(article.hasOwnProperty('title')).toBe(true);
          expect(article.hasOwnProperty('article_id')).toBe(true);
          expect(article.hasOwnProperty('topic')).toBe(true);
          expect(article.hasOwnProperty('created_at')).toBe(true);
          expect(article.hasOwnProperty('votes')).toBe(true);
          expect(article.hasOwnProperty('article_img_url')).toBe(true);
          expect(article.hasOwnProperty('comment_count')).toBe(true);
          expect(article.hasOwnProperty('body')).toBe(false);
        });

      });
  });
  test('200 responds with a sorted by created_at array of objects in descending order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const articles = response._body;
        expect(articles.length).not.toBe(0);
        expect(articles).toBeSortedBy('created_at', { descending: true, coerce: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200 responds with an array of comments for the given article_id", () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((response) => {
        const comments = response._body.comments;
        expect(comments.length).not.toBe(0);
        comments.forEach(comment => {
          expect(comment.hasOwnProperty('comment_id')).toBe(true);
          expect(comment.hasOwnProperty('votes')).toBe(true);
          expect(comment.hasOwnProperty('created_at')).toBe(true);
          expect(comment.hasOwnProperty('author')).toBe(true);
          expect(comment.hasOwnProperty('body')).toBe(true);
          expect(comment.hasOwnProperty('article_id')).toBe(true);
        });
        expect(comments).toBeSortedBy('created_at', { descending: true, coerce: true });
      });
  });

  describe("404 not found", () => {
    test('responds with 404 and Not a valid id  when passing an invalid id', () => {
      return request(app)
        .get('/api/articles/myid/comments')
        .expect(400)
        .then((response) => {
          expect(response._body.error).toBe('Not a valid id');

        });
    });
  });
  test('responds with 200 and Not a valid id  when passing a valid id but no articles exist', () => {
    return request(app)
      .get('/api/articles/2222/comments')
      .expect(404)
      .then((response) => {
        expect(response._body.error).toBe('Article not found');

      });
  });
});


describe("POST /api/articles/:article_id/comments", () => {
  test('endpoint should respond with 201 and object of posted comment', () => {
    const postObj = { username: "icellusedkars", body: "Test comment, test-comment, test, TEST COMMENT, comment" };
    return request(app).post('/api/articles/9/comments').send(postObj).expect(201).then((response) => {
      const comment = response._body.comment;
      console.log(comment);

      expect(typeof comment).toBe('object');
      expect(comment.author).toEqual(postObj.username);
      expect(comment.body).toEqual(postObj.body);
      expect(comment.hasOwnProperty('comment_id')).toBe(true);
      expect(comment.hasOwnProperty('article_id')).toBe(true);
      expect(comment.hasOwnProperty('votes')).toBe(true);
      expect(comment.hasOwnProperty('created_at')).toBe(true);

    });
  });
  test("400 endpoint responds with Missing fields in the request body is username or body are missing", () => {
    const postObj = { body: "Test comment, test-comment, test, TEST COMMENT, comment" };
    return request(app).post('/api/articles/9/comments').send(postObj).expect(400).then((response) => {
      expect(response._body.error).toBe('Missing fields in the request body');
    });
  });
  test("400 endpoint responds with Missing fields in the request body is username or body are missing", () => {
    const postObj = { username: 'icellusedkars' };
    return request(app).post('/api/articles/9/comments').send(postObj).expect(400).then((response) => {
      expect(response._body.error).toBe('Missing fields in the request body');
    });
  });

  test("400 endpoint rejects with message Not a valid user input when passed a non string username", () => {
    const postObj = { body: "Test comment, test-comment, test, TEST COMMENT, comment", username: 9 };
    return request(app).post('/api/articles/9/comments').send(postObj).expect(400).then((error) => {
      expect(error._body.error).toBe('Not a valid user input');
    });
  });

  test("400 endpoint rejects with message Not a valid user input when passed a non string username", () => {
    const postObj = { body: "Test comment, test-comment, test, TEST COMMENT, comment", username: "icellusedkars" };
    return request(app).post('/api/articles/999/comments').send(postObj).expect(404).then((error) => {
      expect(error._body.error).toBe('Article not found');
    });
  });
});

describe.only('PATCH api/articles/article_id', () => {
  test("201 endpoint successfully updates an article's votes", () => {
    const patchObj = { inc_votes: 1 };
    return request(app)
      .patch('/api/articles/9')
      .send(patchObj)
      .expect(201)
      .then((response) => {
        console.log(response._body);

      });
  });
});