const mongoose = require("mongoose");
const Users = require("../Models/Users");
mongoose.connect("mongodb://localhost/nutri-tracker");

var db = mongoose;
Users.findOneAndUpdate(
  {},
  {
    $pull: { ingredients: {} },
  },
  { new: true }
)
  .then(function (con) {
    console.log("sadopijwq");
  })
  .catch(function (err) {
    console.log(err);
  });
