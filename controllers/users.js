const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const BadRequest = require('../errors/badRequest');
const Conflict = require('../errors/conflict');
const NotFound = require('../errors/notFound');
const Unauthorized = require('../errors/unauthorized');
const user = require('../models/user');
const { key } = require('../config/secretKey');

module.exports.getMe = (req, res, next) => {
  user
    .findById(req.user._id)
    .then((users) => res.send({ email: users.email, name: users.name }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  if (!password || password.length < 8) {
    throw new BadRequest('Задайте пароль не менее 8 символов');
  }
  return bcrypt
    .hash(password, 10)
    .then((hash) => user.create({
      email, password: hash, name,
    }))
    .then((users) => res.send({
      data:
        {
          email: users.email,
          name: users.name,
        },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        if (err.errors.email && err.errors.email.kind === 'unique') {
          throw new Conflict('Пользователь с таким E-mail уже существует');
        } else {
          throw new BadRequest('Неверный синтаксис');
        }
      }
    })
    .catch(next);
};

module.exports.getUser = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    throw new BadRequest('Некорректный ID');
  }
  user
    .findById(req.params.userId)
    .orFail(new NotFound('Пользователь с таким id не найден'))
    .then((userr) => {
      res.send(userr);
    })
    .catch(next);
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (password) {
    return user.findUserByCredentials(email, password)
      .then((userObj) => {
        const token = jwt.sign({ _id: userObj._id }, key, { expiresIn: '7d' });
        res.send({ token });
      })
      .catch(next);
  }
  return next(new Unauthorized('Необходимо ввести пароль'));
};
