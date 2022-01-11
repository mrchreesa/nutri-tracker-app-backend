const mongoose = require("mongoose");
const Users = require("../Models/Users");
mongoose.connect("mongodb://localhost/nutri-tracker");
const { exit } = require("process");
var db = mongoose;
Users.findOneAndUpdate(
  {},
  {
    $pull: { ingredients: {} },
  },
  { new: true }
)
  .then(function (con) {
    console.log("[Automated Task] Server cleared profiles");
    exit(1);
  })
  .catch(function (err) {
    console.log(err);
  });
