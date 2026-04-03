const mongoose = require("mongoose");

const members_schema = mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name : {
        type: String,
        required: true,
        trim: true
    },
    about : String,
    domain : String,
    github : String,
    linkedin : String,
    insta : String, 
    city : String,
    country : {type : String, default : "India"},
    position : String,
    pfp :  {
        type: String, default: "Not Uploaded",
    },
    // Authentication fields
    passwordHash: {
        type: String,
        required: function() {
            return this.authProvider === 'local'
        }
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github', 'admin'],
        default: 'local'
    },
    authProviderId: {
        type: String,
        sparse: true
    },
    // Profile information
    year: {
        type: String,
        enum: ['1st', '2nd', '3rd', '4th']
    },
    interests: [String],
    // Membership status
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // Member category
    category: {
        type: String,
        enum: ['community leads', 'domain lead', 'core members'],
        default: 'core members'
    }
}, {
    timestamps: true
})

// Indexes
// Note: email index is created automatically by unique: true
members_schema.index({ domain: 1 })
members_schema.index({ name: 'text', email: 'text' })

// Methods
members_schema.methods.toJSON = function() {
    const obj = this.toObject()
    delete obj.passwordHash
    return obj
}

module.exports = mongoose.model("members" , members_schema)