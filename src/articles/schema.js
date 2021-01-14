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

    cover: String,
    reviews: [
      {
        text: String,
        user: String,
        date: Date,
      },
    ],
    authors: [{ type: Schema.Types.ObjectId, ref: "Authors" }],
    users: [{ type: Schema.Types.ObjectId, numClaps: Number }],
  },
  { timestamps: true }
);
articleSchema.static("findClap", async function (id, userId) {
  const isClapThere = await articleSchema.findOne({
    _id: id,
    "users._id": userId,
  });
  return isClapThere;
});
articleSchema.static("addClap", async function (id, userId) {
  await articleSchema.findOneAndUpdate(
    { _id: id },
    {
      $addToSet: { users: userId },
    }
  );
});
articleSchema.static("incrementClaps", async function (id, userId, numClaps) {
  await articlesSchema.findOneAndUpdate(
    {
      _id: id,
      "users._id": userId,
    },
    { $inc: { "users.$.numClaps": numClaps } }
  );
});
// articleSchema.static("calculateClaps", async function (id) {
//   const { users } = await articleSchema.findById(id);
//   return users
//     .map((user) => user)
//     .reduce((acc, el) => acc + el, 0);
// });
articleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("articles", articleSchema);
