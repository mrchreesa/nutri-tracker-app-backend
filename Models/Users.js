const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "must provide a name"],
    trim: true,
    minLength: 3,
    maxlength: [30, "name can not be more than 30 characters"],
  },
  email: {
    type: String,
    required: [true, "must provide an email"],
    trim: true,
    minLength: 3,
    maxLength: 50,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide valid email address",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "must provide a password"],
    trim: true,
    minLength: [6, "must be at least 6 characters"],
  },
  ingredients: [
    {
      date: {
        type: Date,
        required: true,
      },
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredients",
      },
    },
  ],
});
const ProfileSchema = new mongoose.Schema({});

module.exports = mongoose.model("Users", UsersSchema);
