require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

app.use(express.json());
app.use(cors());

// Serve static files from uploads directory (only in local development)
// In production (Vercel), all images should be served from Cloudinary
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "CtrlZ Community API",
        env: process.env.NODE_ENV || 'development'
    });
});

// Connect to database (async, non-blocking)
const connectDB = require("./config/db");
connectDB().catch(err => {
    console.error('Database connection failed:', err);
});

// Initialize Passport configuration
require("./config/passport");

// Load routes with error handling
try {
    const uploadRoutes = require("./routes/upload");
    const fetchRoutes = require("./routes/fetch");
    const authRoutes = require("./routes/auth");
    const eventsRoutes = require("./routes/events");
    const projectsRoutes = require("./routes/projects");
    const membersRoutes = require("./routes/members");
    const contactRoutes = require("./routes/contact");

    app.use("/upload", uploadRoutes);
    app.use("/fetch", fetchRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/events", eventsRoutes);
    app.use("/api/projects", projectsRoutes);
    app.use("/api/members", membersRoutes);
    app.use("/api/contact", contactRoutes);
} catch (error) {
    console.error('Error loading routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;