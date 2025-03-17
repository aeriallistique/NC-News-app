const axios = require('axios');

const noSleep = () => setInterval(() => {
  axios.get('https://andis-news-app.onrender.com/api')
    .then(({ data }) => {
      console.log({ data });
    });
}, 600000);

noSleep();