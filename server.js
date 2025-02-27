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

app.use(cors());

// Add this middleware before any routes to handle OPTIONS requests
app.use((req, res, next) => {
	if (req.method === "OPTIONS") {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		res.status(200).end();
		return;
	}
	next();
});

// CORS configuration with specific origin
// app.use(
// 	cors({
// 		origin: ["https://nutri-tracker-app-frontend.vercel.app", "http://localhost:3000"], // Allow both production and development
// 		credentials: true,
// 		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
// 		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cookie"],
// 		preflightContinue: false,
// 		optionsSuccessStatus: 200, // Changed from 204 to 200
// 	})
// );

// Handle OPTIONS requests explicitly - BEFORE any routes
app.options("*", (req, res) => {
	// Set CORS headers manually to ensure they're applied
	res.header("Access-Control-Allow-Origin", req.headers.origin === "http://localhost:3000" ? "http://localhost:3000" : "https://nutri-tracker-app-frontend.vercel.app");
	res.header("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Cookie");
	res.header("Access-Control-Allow-Credentials", "true");
	res.status(200).send();
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

// Only start the server if not in serverless environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
	app.listen(port, () => {
		console.log(`Server is listening on port ${port}...`);
	});

	// Only start Bree if not in serverless environment
	const bree = new Bree({
		jobs: [{ name: "cleaning-profile-foods", interval: "at 00:00 am" }],
	});
	bree.start();
}

module.exports = app;
