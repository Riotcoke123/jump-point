const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const db = require('./db/database');
const showsRouter = require('./routes/shows');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: false, // keep simple for self-hosting behind your own reverse proxy
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Make a couple of things available to every view
app.use((req, res, next) => {
  res.locals.siteName = 'Jump Point';
  next();
});

app.use('/', showsRouter);

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Jump Point running at http://localhost:${PORT}`);
});
