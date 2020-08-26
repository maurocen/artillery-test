const express = require('express');
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 10000, // 10 seconds
  max: 5
});

const app = express();

const port = process.env.PORT || 8081;

app.use('/limited', apiLimiter, (req, res) => {
  return res.status(204).send();
});

app.use('/unlimited', (req, res) => {
  return res.status(204).send();
});

app.use((req, res) => {
  return res.status(404).send();
})

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
