const mongoose = require("mongoose");

const connectDB = async ()=>{
    // Use MONGODB_URI or MONGO_CONNECTION_URL (for backward compatibility)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_CONNECTION_URL;
    
    if (!mongoUri) {
        console.error("MongoDB URI not found in environment variables");
        return;
    }

    mongoose
    .connect(mongoUri)
    .then(() => {
        console.log("Database Connected Successfully");
    })
    .catch((err) => {
        console.log("Something Went Wrong", err);
    });


}

module.exports = connectDB ;