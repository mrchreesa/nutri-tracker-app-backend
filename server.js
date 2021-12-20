const express = require("express");
const app = express();
const router = express.Router();
const { json } = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
app.use(cors());
const Ingredients = require("./Routes/Ingredients");
const Users = require("./Routes/Users");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/nutri-tracker");

var db = mongoose;
app.use(json());
app.use(cookieParser());

app.use("/api/ingredients", Ingredients(db));
app.use("/api/users", Users(db));

const port = 8080;

app.use((req, res, next, error) => {});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
