const db = require('../db/connection');
const request = require('supertest');
const {
  convertTimestampToDate,
  createRef,
  formatComments,
  checkArticleExists,
  checkUserExists,
  checkCommentExists,
  sanitizeQUeryObject, isQueryValid,
  isPostObjectValid, checkTopicExists
} = require("../db/seeds/utils");

afterAll(() => db.end());

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createRef", () => {
  test("returns an empty object, when passed an empty array", () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with a single items", () => {
    const input = [{ title: "title1", article_id: 1, name: "name1" }];
    let actual = createRef(input, "title", "article_id");
    let expected = { title1: 1 };
    expect(actual).toEqual(expected);
    actual = createRef(input, "name", "title");
    expected = { name1: "title1" };
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with many items", () => {
    const input = [
      { title: "title1", article_id: 1 },
      { title: "title2", article_id: 2 },
      { title: "title3", article_id: 3 },
    ];
    const actual = createRef(input, "title", "article_id");
    const expected = { title1: 1, title2: 2, title3: 3 };
    expect(actual).toEqual(expected);
  });
  test("does not mutate the input", () => {
    const input = [{ title: "title1", article_id: 1 }];
    const control = [{ title: "title1", article_id: 1 }];
    createRef(input);
    expect(input).toEqual(control);
  });
});

describe("formatComments", () => {
  test("returns an empty array, if passed an empty array", () => {
    const comments = [];
    expect(formatComments(comments, {})).toEqual([]);
    expect(formatComments(comments, {})).not.toBe(comments);
  });
  test("converts created_by key to author", () => {
    const comments = [{ created_by: "ant" }, { created_by: "bee" }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].author).toEqual("ant");
    expect(formattedComments[0].created_by).toBe(undefined);
    expect(formattedComments[1].author).toEqual("bee");
    expect(formattedComments[1].created_by).toBe(undefined);
  });
  test("replaces belongs_to value with appropriate id when passed a reference object", () => {
    const comments = [{ belongs_to: "title1" }, { belongs_to: "title2" }];
    const ref = { title1: 1, title2: 2 };
    const formattedComments = formatComments(comments, ref);
    expect(formattedComments[0].article_id).toBe(1);
    expect(formattedComments[1].article_id).toBe(2);
  });
  test("converts created_at timestamp to a date", () => {
    const timestamp = Date.now();
    const comments = [{ created_at: timestamp }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].created_at).toEqual(new Date(timestamp));
  });
});

describe("checkArticleExists()", () => {
  test("returns error message Category not found when passed in id that doesn't exist", () => {
    return checkArticleExists(9999).catch((response) => {
      expect(response.message).toBe('Article not found');
      expect(response.code).toBe(404);
    });
  });
  test("returns error message Not a valid id when passed something other than a number", () => {
    const myId = 'id';
    return checkArticleExists(myId).catch((error) => {
      expect(error.message).toBe('Not a valid id');
      expect(error.code).toBe(400);
    });
  });
});

describe("checkUserExists", () => {
  test('function returns User not found is passed in an inexistent user', () => {
    return checkUserExists('icellusedka').catch((error) => {
      expect(error.message).toBe('User not found');
      expect(error.code).toBe(404);
    });
  });
  test("function returns Not a valid user input when passe anything other than a string", () => {
    return checkUserExists(3).catch((error) => {
      expect(error.message).toBe('Not a valid user input');
    });
  });
  test("function returns Not a valid user input when passe anything other than a string", () => {
    return checkUserExists(['user']).catch((error) => {
      expect(error.message).toBe('Not a valid user input');
    });
  });

});

describe('checkCommentExists()', () => {
  test("function returns Not a valid id when passed a non number id", () => {
    return checkCommentExists('notNum').catch((error) => {
      expect(error.message).toBe('Not a valid id');
    });
  });
  test("function returns Comment not found when comment does not exist with passsed in id", () => {
    return checkCommentExists(999).catch((error) => {
      expect(error.message).toBe('Comment not found');
    });
  });
});

describe("sanitizsanitizeQUeryObject()", () => {
  test("function returns a new object without mutating input object", () => {
    const input = { sort_by: "votes", order: 'ASC' };
    const output = sanitizeQUeryObject(input);

    expect(typeof output).toBe('object');
    expect(output).not.toBe(input);
    expect(output).not.toBe(input);
    expect(output.hasOwnProperty('sort_by')).toBe(true);
    expect(output.hasOwnProperty('order')).toBe(true);
    expect(output.sort_by).toBe('votes');
    expect(output.order).toBe('ASC');

  });
  test("returns object with sort_by and order properties with default values if no properties exist on the input object", () => {
    const input = {};
    const output = sanitizeQUeryObject(input);

    expect(typeof output).toBe('object');
    expect(output).not.toBe(input);
    expect(output.hasOwnProperty('sort_by')).toBe(true);
    expect(output.hasOwnProperty('order')).toBe(true);
    expect(output.sort_by).toBe('created_at');
    expect(output.order).toBe('DESC');
  });
  test("returns object with properties of sorty_by, order and topic when topic is passed in", () => {
    const input = { sort_by: '', order: 'ASC', topic: 'cats' };
    const output = sanitizeQUeryObject(input);

    expect(typeof output).toBe('object');
    expect(output).not.toBe(input);
    expect(output.hasOwnProperty('sort_by')).toBe(true);
    expect(output.hasOwnProperty('order')).toBe(true);
    expect(output.hasOwnProperty('topic')).toBe(true);
    expect(output.sort_by).toBe('created_at');
    expect(output.order).toBe('ASC');
    expect(output.topic).toBe('cats');
    expect(output).toEqual({ sort_by: 'created_at', order: 'ASC', topic: 'cats' });
  });

  test("returns an empty object if passed invalid sort_by and order", () => {
    const input = { sort_by: 'notAValid', order: 'EFG', topic: 'cats' };
    const output = sanitizeQUeryObject(input);
    expect(Object.entries(output).length).toBe(0);
  });
});

describe("isQueryValid()", () => {
  test("function returns true if vote anc comment id values are valid", () => {
    const input = { inc_votes: 1, comment_id: 4 };
    const output = isQueryValid(input);
    expect(typeof output).toBe('boolean');
    expect(output).toBe(true);
  });
  test("function returns false when passed an invalid vote value", () => {
    const input = { inc_votes: 3, comment_id: 4 };
    const output = isQueryValid(input);
    expect(output).toBe(false);
  });
  test("function returns an empty object when passed an invalid comment id value", () => {
    const input = { inc_votes: -1, comment_id: 'notandID' };
    const output = isQueryValid(input);
    expect(output).toBe(false);
  });
});
describe("checkTopicExists()", () => {
  test("function returns true if topic exists", () => {
    return checkTopicExists('cats').then((result) => {
      expect(result).toBe(true);
    });
  });
  test("function returns error message 'Topic not found' if topic doesn't exist", () => {
    return checkTopicExists('cat').catch((err) => {
      expect(err.message).toBe('Topic not found');
    });
  });
  test("function returns error message not a valid topic input if passed it a non string value", () => {
    return checkTopicExists(9).catch((err) => {
      expect(err.message).toBe('Not a valid topic input');
    });
  });
});

describe("isPostObjectValid() will either return true OR error message ", () => {
  test("function returns true if an user/author and topic exist and all properties are strings", () => {
    const queryObj = {
      title: "Manchester UK a short story",
      topic: "cats",
      author: "rogersop",
      body: "Manchester is a great city with ONE great football team and also Man city.!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return isPostObjectValid(queryObj).then((result) => {
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });
  test("function returns 'Topic not found' error message is topic does not exist", () => {
    const queryObj = {
      title: "Manchester UK a short story",
      topic: "cat",
      author: "rogersop",
      body: "Manchester is a great city with ONE great football team and also Man city.!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return isPostObjectValid(queryObj).catch((err) => {
      expect(err.message).toBe('Topic not found');
      expect(err.code).toBe(404);
    });
  });
  test("function returns 'User not found' error message is author does not exist", () => {
    const queryObj = {
      title: "Manchester UK a short story",
      topic: "cats",
      author: "roger",
      body: "Manchester is a great city with ONE great football team and also Man city.!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return isPostObjectValid(queryObj).catch((err) => {
      expect(err.message).toBe('User not found');
      expect(err.code).toBe(404);
    });
  });
});