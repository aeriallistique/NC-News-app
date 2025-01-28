const endpointsJson = require("../endpoints.json");
const request = require('supertest');
/* Set up your test imports here */
const db = require('../db/connection');
const app = require('../app');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const articles = require("../db/data/test-data/articles");

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

afterAll((done) => {
  db.end();
  done();
});

describe.skip("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
describe.skip("GET /api/topics", () => {
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

describe.skip("GET/api/articles/:article_id", () => {
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
  test('400 bad request, responds with error message bad request', () => {
    return request(app)
      .get('/api/articles/notandID')
      .expect(400)
      .then((response) => {
        expect(response._body.error).toBe('Bad request.');
      });
  });
});

describe.skip("GET /api/articles", () => {
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
    return request(app).get('/api/articles/9/comments').expect(200).then((response) => {
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
      expect(comments).toBeSortedBy('created_at', { descending: true, coerce: false });
    });
  }, 10000);

  describe("404 not found", () => {
    test('responds with 404 and No comment with article_id found when there are no comments with specified ID', () => {
      return request(app).get('/api/articles/2/comments').expect(404).then((response) => {
        expect(response._body.error).toBe('No comment with article_id found');

      });
    });
  });
});