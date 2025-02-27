const express = require("express");
const session = require("express-session");
const app = express();
const router = express.Router();
const { json } = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Bree = require("bree");
const mongoose = require("mongoose");

require("dotenv").config();

// Basic middleware setup
app.use(json());
app.use(cookieParser());
app.set("trust proxy", 1);

// Very permissive CORS configuration
app.use(
	cors({
		origin: true, // Allow any origin
		credentials: true, // Allow credentials
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cookie"],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	})
);

// Handle OPTIONS requests explicitly
app.options("*", (req, res) => {
	res.status(204).end();
});

const Ingredients = require("./Routes/Ingredients");
const Users = require("./Routes/Users");

// Connect to MongoDB with error handling
mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => console.log("MongoDB connected successfully"))
	.catch((err) => console.error("MongoDB connection error:", err));

var db = mongoose;

// Define routes after CORS setup
app.use("/ingredients", Ingredients(db));
app.use("/users", Users(db));

// Add error handling middleware
app.use((err, req, res, next) => {
	console.error("Server error:", err);
	res.status(500).json({ message: "Internal server error", error: process.env.NODE_ENV === "production" ? null : err.message });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
	console.log(`Server is listening on port ${port}...`);
});

// Only start Bree if not in serverless environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
	const bree = new Bree({
		jobs: [{ name: "cleaning-profile-foods", interval: "at 00:00 am" }],
	});
	bree.start();
}

module.exports = app;
