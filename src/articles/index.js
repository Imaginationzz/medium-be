const express = require("express");
const mongoose = require("mongoose");
const q2m = require("query-to-mongo");
const articleSchema = require("./schema");

const articlesRouter = express.Router();

articlesRouter.get("/", async (req, res, next) => {
  try {
    const articles = await articleSchema.find().populate("authors");
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

articlesRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const article = await articleSchema.findById(articleId, { _id: 0 });
    const review = { ...article.toObject(), ...req.body, date: new Date() };

    const updated = await articleSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviews: review,
        },
      },
      { runValidators: true, new: true }
    );
    res.status(201).send(updated);
  } catch (error) {
    next(error);
  }
});

articlesRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const { reviews } = await articleSchema.findById(req.params.id, {
      reviews: 1,
      _id: 0,
    });
    res.send(reviews);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

articlesRouter.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await articleSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );

    if (reviews && reviews.length > 0) {
      res.send(reviews[0]);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

articlesRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedArticle = await articleSchema.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          reviews: {
            _id: mongoose.Types.ObjectId(req.params.reviewId),
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    res.send(modifiedArticle);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

articlesRouter.put("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await articleSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );

    if (reviews && reviews.length > 0) {
      const reviewToEdit = { ...reviews[0].toObject(), ...req.body };

      const modifiedReview = await articleSchema.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "reviews._id": mongoose.Types.ObjectId(req.params.reviewId),
        },
        { $set: { "reviews.$": reviewToEdit } },
        {
          runValidators: true,
          new: true,
        }
      );
      res.send(modifiedReview);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

articlesRouter.get("/pagination", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await articleSchema.countDocuments(query.criteria);
    const articles = await articleSchema
      .find(query.criteria)
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .populate("authors");

    res.send({ links: query.links("/articles", total), articles });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

articlesRouter.post("/:id/claps/:userId", async (req, res, next) => {
  try {
    const isClapThere = await articleSchema.findClap(
      req.params.id,
      req.params.userId
    );
    if (!isClapThere) {
      {
        await articleSchema.addClap(req.params.id, isClapThere);
        res.send("New clap added!");
      }
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
module.exports = articlesRouter;
