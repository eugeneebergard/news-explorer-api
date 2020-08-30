require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { Joi, celebrate, errors } = require('celebrate');

const { usersRouter, articlesRouter } = require('./routes/index.js');

const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const rateLimiterUsingThirdParty = require('./middlewares/rateLimit');

const { login, createUser } = require('./controllers/users');

const NotFound = require('./errors/notFound');
const { serverError } = require('./errors/serverError');

const { url } = require('./config/mongoUrl');

const { PORT = 3000 } = process.env;

const app = express();

const whitelist = [
  'http://localhost:8080',
  'http://news-explorer-ee.tk',
  'https://news-explorer-ee.tk',
  'http://www.news-explorer-ee.tk',
  'https://www.news-explorer-ee.tk',
  'https://eugeneebergard.github.io/news-explorer-frontend'];

const corsOptions = {
  origin: whitelist,
  credentials: true,
  methods: 'GET,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.post('/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  rateLimiterUsingThirdParty,
  createUser);

app.post('/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  rateLimiterUsingThirdParty,
  login);

app.use('/users', auth, rateLimiterUsingThirdParty, usersRouter);
app.use('/articles', auth, rateLimiterUsingThirdParty, articlesRouter);

app.use((req, res, next) => {
  next(new NotFound('Не найдено'));
});

app.use(errorLogger);
app.use(errors());
app.use(serverError);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Ссылка на сервер: localhost:${PORT}`);
});
