require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const uploadRoutes = require("./routes/upload");
const fetchRoutes = require("./routes/fetch");
const authRoutes = require("./routes/auth");
const eventsRoutes = require("./routes/events");
const projectsRoutes = require("./routes/projects");
const membersRoutes = require("./routes/members");
const contactRoutes = require("./routes/contact");


const coreMembersModel = require("./models/coreMembers");
const domainLeadsModel = require("./models/domainLeads");
const membersModel = require("./models/members");
const connectDB = require("./config/db");



app.use("/upload", uploadRoutes);
app.use("/fetch", fetchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/contact", contactRoutes);



app.get("/", (req, res) => {
    res.send("hello cutie");
})

connectDB()

app.listen(3000);