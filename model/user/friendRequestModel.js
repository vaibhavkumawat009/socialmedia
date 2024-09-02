const mongoose = require("mongoose")

const friendSchema = mongoose.Schema({

    senderUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }


}, { timestamps: true })

const FriendRequest = new mongoose.model("FriendRequest", friendSchema)
module.exports = FriendRequest