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
  return db.end();
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
        const topics = response.body.topics;
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
        const { article } = response.body;
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
        expect(response.body.error).toBe('Article not found');
      });
  });

});
describe('404 not found', () => {
  test('400 bad request, responds with error message bad request', () => {
    return request(app)
      .get('/api/articles/Id3')
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Not a valid id');
      });
  });
});

describe("GET /api/articles", () => {
  test('200 responds with an articles array of objects with correct properties', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const articles = response.body;
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
        const articles = response.body;
        expect(articles.length).not.toBe(0);
        expect(articles).toBeSortedBy('created_at', { descending: true, coerce: true });
      });
  });

  describe("200 responds with a sorted array by any valid column and ordered in descending order", () => {
    test('200 reponds with a sorted array by title in descending order', () => {
      return request(app)
        .get('/api/articles?sort_by=title&order=DESC')
        .expect(200)
        .then((resp) => {
          expect(resp.body.length).toBeGreaterThan(0);
          expect(resp.body).toBeSortedBy('title', { descending: true });
        });
    });
    test('200 reponds with a sorted array by votes in ascending order', () => {
      return request(app)
        .get('/api/articles?sort_by=votes&order=ASC')
        .expect(200)
        .then((resp) => {
          expect(resp.body.length).toBeGreaterThan(0);
          expect(resp.body).toBeSortedBy('votes');
        });
    });
  });
  describe("400 responds with 'Prohibited query parameter' when passed an ineligible query parameter", () => {
    test("400 responds with 'Prohibited query parameter' when passed sorty_by= notacolumn", () => {
      return request(app)
        .get('/api/articles?sort_by=notacolumn&order=ASC')
        .expect(400)
        .then((resp) => {
          expect(resp.body.error).toBe('Prohibited query parameter');
          expect(resp.body.code).toBe(400);
        });
    });
    test("400 responds with 'Prohibited query parameter' when passed order=NOTASC", () => {
      return request(app)
        .get('/api/articles?sort_by=title&order=NOTASC')
        .expect(400)
        .then((resp) => {
          expect(resp.body.error).toBe('Prohibited query parameter');
          expect(resp.body.code).toBe(400);
        });
    });
  });

  describe("200 endpoind should respond with filtered articles by topic", () => {
    test("200 endpoint responds with filtered articles by topic = mitch", () => {
      return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then((resp) => {
          expect(resp.body.length).not.toBe(0);
          resp.body.forEach(article => {
            expect(article.topic).toBe('mitch');
          });
        });
    });
    test("200 endpoint responds with filtered articles by topic = cats", () => {
      return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then((resp) => {
          expect(resp.body.length).not.toBe(0);
          resp.body.forEach(article => {
            expect(article.topic).toBe('cats');
          });
        });
    });
    describe("200 if passed invalid topic endpoint returns all articles", () => {
      test("200 if passed invalid topic endpoint returns all articles", () => {
        return request(app)
          .get('/api/articles?topic=notValidTopic')
          .expect(200)
          .then((resp) => {
            expect(resp.body.length).not.toBe(0);
            const topicsArray = resp.body.map((article => article.topic));
            expect(topicsArray.includes('mitch')).toBe(true);
            expect(topicsArray.includes('cats')).toBe(true);
          });
      });
    });
  });

});

describe("GET /api/articles/:article_id/comments", () => {
  test("200 responds with an array of comments for the given article_id", () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
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
          expect(response.body.error).toBe('Not a valid id');

        });
    });
  });
  test('responds with 200 and Not a valid id  when passing a valid id but no articles exist', () => {
    return request(app)
      .get('/api/articles/2222/comments')
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe('Article not found');

      });
  });
});


describe("POST /api/articles/:article_id/comments", () => {
  test('endpoint should respond with 201 and object of posted comment', () => {
    const postObj = { username: "icellusedkars", body: "Test comment, test-comment, test, TEST COMMENT, comment" };
    return request(app).post('/api/articles/9/comments').send(postObj).expect(201).then((response) => {
      const comment = response.body.comment;
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
      expect(response.body.error).toBe('Missing fields in the request body');
    });
  });
  test("400 endpoint responds with Missing fields in the request body is username or body are missing", () => {
    const postObj = { username: 'icellusedkars' };
    return request(app).post('/api/articles/9/comments').send(postObj).expect(400).then((response) => {
      expect(response.body.error).toBe('Missing fields in the request body');
    });
  });

  test("400 endpoint rejects with message Not a valid user input when passed a non string username", () => {
    const postObj = { body: "Test comment, test-comment, test, TEST COMMENT, comment", username: 9 };
    return request(app).post('/api/articles/9/comments').send(postObj).expect(400).then((error) => {
      expect(error.body.error).toBe('Not a valid user input');
    });
  });

  test("400 endpoint rejects with message Not a valid user input when passed a non string username", () => {
    const postObj = { body: "Test comment, test-comment, test, TEST COMMENT, comment", username: "icellusedkars" };
    return request(app).post('/api/articles/999/comments').send(postObj).expect(404).then((error) => {
      expect(error.body.error).toBe('Article not found');
    });
  });
});

describe('PATCH api/articles/article_id', () => {
  test("201 endpoint successfully updates an article's votes", () => {
    const patchObj = { inc_votes: 1 };
    return request(app)
      .patch('/api/articles/9')
      .send(patchObj)
      .expect(201)
      .then((resp) => {
        const article = resp.body.article;
        expect(typeof article).toBe('object');
        expect(article.votes).toBe(1);
        expect(article.hasOwnProperty('article_id')).toBe(true);
        expect(article.hasOwnProperty('title')).toBe(true);
        expect(article.hasOwnProperty('topic')).toBe(true);
        expect(article.hasOwnProperty('author')).toBe(true);
        expect(article.hasOwnProperty('body')).toBe(true);
        expect(article.hasOwnProperty('created_at')).toBe(true);
        expect(article.hasOwnProperty('article_img_url')).toBe(true);
      });
  });

  test("201 endpoint updated votes by provided amount", () => {
    const patchObj = { inc_votes: 20 };
    return request(app)
      .patch('/api/articles/9')
      .send(patchObj)
      .expect(201)
      .then((resp) => {
        const article = resp.body.article;
        expect(article.votes).toBe(20);
      });
  });
  test("201 endpoint updates votes by provided negative amount", () => {
    const patchObj = { inc_votes: -10 };
    return request(app)
      .patch('/api/articles/9')
      .send(patchObj)
      .expect(201)
      .then((resp) => {
        const article = resp.body.article;
        expect(article.votes).toBe(-10);
      });
  });

  describe("PATCH", () => {
    test("400 endpoint responds with missing fields in request body", () => {
      return request(app)
        .patch('/api/articles/9')
        .send({})
        .expect(400)
        .then((resp) => {
          expect(resp.body.error).toBe('Missing fields in the request body');

        });
    });
    test("400 endpoint responds with missing fields in request body", () => {
      return request(app)
        .patch('/api/articles/9')
        .send({ inc_votes: 'notanumb' })
        .expect(400)
        .then((resp) => {
          expect(resp.body.error).toBe('Missing fields in the request body');

        });
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204 endpoint deletes comment with specified comment_id", () => {
    return request(app)
      .delete('/api/comments/2')
      .expect(204);

  });
  test("400 bad request endpoint if passed in a non number as comment_id", () => {
    return request(app)
      .delete('/api/comments/notId')
      .expect(400)
      .then((resp) => {
        expect(resp.body.error).toBe('Not a valid id');
      });
  });

  test("404 not found endpoint if passed an id for a comment that doesn't exist", () => {
    return request(app)
      .delete('/api/comments/888')
      .expect(404)
      .then((resp) => {
        expect(resp.body.error).toBe('Comment not found');
      });
  });
});

describe("GET /api/users", () => {
  test("GET all users", () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then((resp) => {
        expect(Array.isArray(resp._body)).toBe(true);
        expect(resp.body.length).toBeGreaterThan(0);
        resp.body.forEach(user => {
          expect(typeof user).toBe('object');
          expect(user.hasOwnProperty('username')).toBe(true);
          expect(user.hasOwnProperty('name')).toBe(true);
          expect(user.hasOwnProperty('avatar_url')).toBe(true);
        });

      });
  });
});

describe("GET /api/users/:username", () => {
  test("200 responds with a user object based on username provided", () => {
    return request(app)
      .get('/api/users/rogersop')
      .expect(200)
      .then((resp) => {
        const user = resp.body.user;
        expect(typeof user).toBe('object');
        expect(user.hasOwnProperty('username')).toBe(true);
        expect(user.hasOwnProperty('name')).toBe(true);
        expect(user.hasOwnProperty('avatar_url')).toBe(true);
        expect(user.username).toBe('rogersop');
        expect(user.name).toBe('paul');
        expect(user.avatar_url).toBe('https://avatars2.githubusercontent.com/u/24394918?s=400&v=4');
      });
  });
  test('404 not found, responds with if passed in a non existent but valid username', () => {
    return request(app)
      .get('/api/users/leonardo')
      .expect(404)
      .then((resp) => {
        const { error } = resp.body;
        expect(error).toBe('User not found');
      });
  });
  test('400 invalid username parameter, responds with if passed in a number instead of a string', () => {
    return request(app)
      .get('/api/users/234')
      .expect(400)
      .then((resp) => {
        const { error } = resp.body;
        expect(error).toBe('Invalid username parameter');
      });
  });
})


