const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const URLSlugs = require("mongoose-url-slugs");

const post = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

post.plugin(
  URLSlugs("title", {
    field: "url"
  })
);

post.set("toJSON", {
  virtuals: true
});

module.exports = mongoose.model("Post", post);
