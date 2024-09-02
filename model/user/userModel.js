const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        unique: true

    },
    salt: {
        type: String
    },
    hash: {
        type: String
    },
    password: {
        type: String,

    },
    friendsList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    friendRequestsSent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FriendRequest'
        }
    ],
    friendRequestsReceived: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FriendRequest',
        }
    ]

}, { timestamps: true })

const User = new mongoose.model("user", userSchema)
module.exports = User