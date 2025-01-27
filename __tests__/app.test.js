const endpointsJson = require("../endpoints.json");
const request = require('supertest');
/* Set up your test imports here */
const db = require('../db/connection');
const app = require('../app');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

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
      .get('/api/articles/3')
      .expect(200)
      .then((response) => {
        const { article } = response._body;
        console.log(article);
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
