const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: true
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      sparse: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

user.set("toJSON", {
  virtuals: true
});

module.exports = mongoose.model("User", user);
