const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved'],
        default: 'new'
    }
}, {
    timestamps: true
})

// Indexes
contactSchema.index({ status: 1 })
contactSchema.index({ createdAt: -1 })

module.exports = mongoose.model('contact', contactSchema)
