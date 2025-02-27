const express = require("express");
const app = express();
const { json } = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

// Middleware
app.use(json());
app.use(cookieParser());
app.set("trust proxy", 1);

// CORS configuration
app.use(
	cors({
		origin: ["https://nutri-tracker-app-frontend.vercel.app", "http://localhost:3000"],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cookie"],
		credentials: true,
		optionsSuccessStatus: 200,
	})
);

// MongoDB connection
mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => console.log("MongoDB connected successfully"))
	.catch((err) => console.error("MongoDB connection error:", err));

const db = mongoose;

// Routes
const Ingredients = require("./Routes/Ingredients");
const Users = require("./Routes/Users");
app.use("/users", Users(db));
app.use("/ingredients", Ingredients(db));

// Catch-all for debugging
app.all("*", (req, res) => {
	console.log(`Received request: ${req.method} ${req.path}`);
	res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// Error handling
app.use((err, req, res, next) => {
	console.error("Server error:", err);
	res.status(500).json({ message: "Internal server error" });
});

// Local development only
const port = process.env.PORT || 8080;
if (!process.env.VERCEL) {
	app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
