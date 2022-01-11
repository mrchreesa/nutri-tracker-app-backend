const express = require("express");
const app = express();
const router = express.Router();
const { json } = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Bree = require("bree");
const mongoose = require("mongoose");

require("dotenv").config();

app.use(function (req, res, next) {
  //potential timeout problem with request.
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const Ingredients = require("./Routes/Ingredients");
const Users = require("./Routes/Users");

mongoose.connect("mongodb://localhost/nutri-tracker");

var db = mongoose;

app.use(json());
app.use(cookieParser());

app.use("/api/ingredients", Ingredients(db));
app.use("/api/users", Users(db));

const port = 8080;

//app.use((req, res, next, error) => {});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is listening on port ${port}...`);
});
const bree = new Bree({
  jobs: [{ name: "cleaning-profile-foods", interval: "at 00:00 am" }],
});
bree.start();
module.exports = app;
