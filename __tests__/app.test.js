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
describe.only("GET /api/topics", () => {
  test("200 responds with and array of topic objects", () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then((response) => {
        const result = response._body.topics;
        expect(Array.isArray(result)).toBe(true);
        result.forEach(obj => {
          expect(obj.hasOwnProperty('slug')).toBe(true);
          expect(obj.hasOwnProperty('description')).toBe(true);
        });


      });

  });
});
