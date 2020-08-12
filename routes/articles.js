const articlesRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getArticles, createArticle, deleteArticle } = require('../controllers/articles');
const regUrl = require('../config/regexForUrl');

articlesRouter.get('/', getArticles);
articlesRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      keyword: Joi.string()
        .required(),
      title: Joi.string()
        .required(),
      text: Joi.string()
        .required(),
      date: Joi.string()
        .required(),
      source: Joi.string()
        .required(),
      image: Joi.string()
        .required()
        .pattern(regUrl)
        .error(() => new Error('Ошибка валидации')),
      link: Joi.string()
        .required()
        .pattern(regUrl)
        .error(() => new Error('Ошибка валидации')),
    }),
  }),
  createArticle,
);
articlesRouter.delete(
  '/:articleId',
  celebrate({
    params: Joi.object().keys({
      articleId: Joi.string().length(24).hex(),
    }),
  }),
  deleteArticle,
);

module.exports = articlesRouter;
