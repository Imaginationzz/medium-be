const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const articleSchema = new Schema(
  {
    headLine: {
      type: String,
      required: true,
    },
    subHead: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    category: {
      name: String,
      img: String,
    },
    author: {
      name: String,
      img: String,
    },
    cover: String,
  },
  { timestamps: true }
);
articleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("articles", articleSchema);
