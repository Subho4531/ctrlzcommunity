const mongoose = require("mongoose") ;

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true
    },
    domains: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0
            },
            message: 'At least one domain is required'
        }
    },
    repo: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true
                return /^https?:\/\/.+/.test(v)
            },
            message: 'Repository must be a valid URL'
        }
    },
    demo: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true
                return /^https?:\/\/.+/.test(v)
            },
            message: 'Demo must be a valid URL'
        }
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'members'
    }
}, {
    timestamps: true
})

// Indexes
projectSchema.index({ status: 1 })
projectSchema.index({ domains: 1 })

module.exports = mongoose.model('project' , projectSchema) ;
