const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const image = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    path: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

image.set("toJSON", {
  virtuals: true
});

module.exports = mongoose.model("Image", image);
