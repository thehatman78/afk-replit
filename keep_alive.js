const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Afk bot is running!'));

function keep_alive() {
  app.listen(port, () => console.log(`Keep-alive server listening on port ${port}`));
}

module.exports = { keep_alive };
