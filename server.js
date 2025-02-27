const express = require("express");
const session = require("express-session");
const app = express();
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

// Add this middleware before any routes to handle OPTIONS requests
app.use((req, res, next) => {
	if (req.method === "OPTIONS") {
		const allowedOrigins = ["https://nutri-tracker-app-frontend.vercel.app", "http://localhost:3000"];
		const origin = req.headers.origin;
		if (allowedOrigins.includes(origin)) {
			res.setHeader("Access-Control-Allow-Origin", origin);
		}
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Cookie");
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.status(200).end();
		return;
	}
	next();
});

// CORS configuration with specific origin
app.use(
	cors({
		origin: ["https://nutri-tracker-app-frontend.vercel.app", "http://localhost:3000"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cookie"],
		preflightContinue: false,
		optionsSuccessStatus: 200,
	})
);

// Import route handlers
const Ingredients = require("./Routes/Ingredients");
const Users = require("./Routes/Users");

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => console.log("MongoDB connected successfully"))
	.catch((err) => console.error("MongoDB connection error:", err));

var db = mongoose;

// Define routes - IMPORTANT: Make sure these paths match what your frontend is requesting
app.use("/users", Users(db)); // This should match the frontend request path
app.use("/ingredients", Ingredients(db));

// Add a catch-all route for debugging
app.all("*", (req, res) => {
	console.log(`Received request: ${req.method} ${req.path}`);
	res.status(404).send(`Route not found: ${req.method} ${req.path}`);
});

// Error handling middleware
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
