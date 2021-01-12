const express = require("express");

const articleSchema = require("./schema");

const articlesRouter = express.Router();

articlesRouter.get("/", async (req, res, next) => {
  try {
    const articles = await articleSchema.find();
    res.send(articles);
  } catch (error) {
    next(error);
  }
});

articlesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const article = await articleSchema.findById(id);
    if (article) {
      res.send(article);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading articles list a problem occurred!");
  }
});

articlesRouter.post("/", async (req, res, next) => {
  try {
    const newArticle = new articleSchema(req.body);
    const { _id } = await newArticle.save();

    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

articlesRouter.put("/:id", async (req, res, next) => {
  try {
    const article = await articleSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (article) {
      res.send(article);
    } else {
      const error = new Error(`article with id ${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

articlesRouter.delete("/:id", async (req, res, next) => {
  try {
    const article = await articleSchema.findByIdAndDelete(req.params.id);
    if (article) {
      res.send("Deleted");
    } else {
      const error = new Error(`article with id ${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = articlesRouter;
