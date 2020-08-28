const express = require('express');
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser')
const fetch = require('node-fetch');

const apiLimiter = rateLimit({
  windowMs: 10000, // 10 seconds
  max: 5
});

const app = express();

const port = process.env.PORT || 8081;

app.use(bodyParser.json());

app.use('/limited', apiLimiter, (req, res) => {
  return res.status(204).send();
});

app.use('/unlimited', (req, res) => {
  return res.status(204).send();
});

app.post('/double', (req, res) => {
  const { number } = req.body;

  if (!number || isNaN(number)) {
    return res.status(400).send();
  }

  return res.json({ double: number * 2 });
});

app.get('/google', async (req, res) => {
  try {
    const googleUp = await fetch('https://google.com');
    return res.status(googleUp.status).json({ success: googleUp.status < 300 && googleUp.status >= 200 });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.use((req, res) => {
  return res.status(404).send();
})

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
