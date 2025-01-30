# Andi's News API

This project contains an API that fetches articles, comments, topics or users.It allows users to vote on a comment or article. The full description of this API is available in `endpoints.json` or [here](https://andis-news-app.onrender.com/api)
Live demos is [here](https://andis-news-app.onrender.com/)
---
## Setup
1. Fork the repo and clone it
2. Run `npm install` to install all packages
3. Create a `.env.test` and `.env.development` files. Add into each file a `PGDATABASE=` variable with the correct name for that environment ( please refer to `db/setup.sql`)
4. Check integration and utils tests in `__tests_` folder.
---
## Packages
This project uses:
- express
- node-postgress
- dotenv

For testing:
- jest
- supertest
- jest-sorted

Min version of Node is **20.09.0**
Min version of Node Postgress is **8.7.3**

--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
