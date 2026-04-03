const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v)
            },
            message: 'Date must be a valid Date object'
        }
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed'],
        default: 'upcoming'
    },
    registrationLink: {
        type: String,
        trim: true
    },
    capacity: {
        type: Number,
        min: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'members'
    }
}, {
    timestamps: true
})

// Indexes
eventSchema.index({ date: -1 })
eventSchema.index({ status: 1 })

module.exports = mongoose.model('event', eventSchema)
