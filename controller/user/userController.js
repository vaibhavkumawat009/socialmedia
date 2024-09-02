const { jwtDecode } = require("jwt-decode")
const mongoose = require('mongoose')

const { sendResponse } = require("../../utils/sendResponse.js")
const { statusCode } = require("../../constants/statusCode.js")
const { successMessage, errorMessage } = require("../../constants/messages.js")
//models
const User = require("../../model/user/userModel.js")
const FriendRequest = require('../../model/user/friendRequestModel.js')

const { genPassword, validPassword } = require("../../utils/passwordUtils.js")
const { generateToken } = require("../../utils/genToken.js")

//signup
exports.createUser = async (req, res) => {
    try {
        const data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,

        }

        const passwordGen = genPassword(req.body.password)
        data.salt = passwordGen.salt
        data.hash = passwordGen.hash
        let result = await User.create(data);
        let token = await generateToken(result)
        const finalResult = result.toObject()
        finalResult.token = token

        return sendResponse(res, statusCode.OK, true, `User ${successMessage.CREATED_SUCCESS}`, finalResult)
    } catch (error) {
        console.log(error);
        return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, false, `${errorMessage.INTERNAL_SERVER}`, error)

    }
}

//login
exports.loginUser = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            return sendResponse(res, statusCode.BAD_REQUEST, false, `User ${errorMessage.NOT_FOUND}`)
        }
        const validated = validPassword(req.body.password, user.hash, user.salt)

        let token = await generateToken(user)
        return validated ? sendResponse(res, statusCode.OK, true, `User Login ${successMessage.SUCCESSFULL}`, token) : sendResponse(res, statusCode.OK, false, `${errorMessage.WRONG_PASSWORD}`)
    } catch (error) {
        console.log(error);
        return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, false, `${errorMessage.INTERNAL_SERVER}`, error)

    }
}

//getUser
exports.getUser = async (req, res) => {
    try {

        const token = req.headers['authorization'];
        const decoded = jwtDecode(token);
        const id = decoded.id
        const result = await User.find({ _id: id }).populate(['friendsList', 'friendRequestsSent', 'friendRequestsReceived'])
        return sendResponse(res, statusCode.OK, true, `User ${successMessage.GET_SUCCESS}`, result)
    }
    catch (error) {
        console.log(error);
        return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, false, `${errorMessage.INTERNAL_SERVER}`, error)
    }
}


//listUser
exports.listUser = async (req, res) => {
    try {

        const result = await User.find().populate(['friendsList', 'friendRequestsSent', 'friendRequestsReceived'])

        return sendResponse(res, statusCode.OK, true, `User ${successMessage.GET_SUCCESS}`, result)
    }
    catch (error) {
        console.log(error);
        return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, false, `${errorMessage.INTERNAL_SERVER}`, error)
    }
}


//send friend request
exports.sendRequest = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const decoded = jwtDecode(token);
        const senderUserId = decoded.id
        const receiverUserId = req.body.id
        const data = {
            senderUserId,
            receiverUserId,
        }
        const reciever = await User.findOne({ _id: receiverUserId })
        const existFriendRequest = await FriendRequest.findOne({ $and: [{ senderUserId: senderUserId }, { receiverUserId: receiverUserId }, { status: 'pending' }] })
        const existFriends = await User.findOne({ $and: [{ _id: senderUserId }, { friendsList: receiverUserId }] })
        if(senderUserId==receiverUserId){
            return sendResponse(res, statusCode.BAD_REQUEST, false, `${errorMessage.BAD_REQUEST}`)

        }
        if (existFriends) {
            return sendResponse(res, statusCode.BAD_REQUEST, false, `${errorMessage.ALREADY_EXIST}ing Friends`)

        }
        if (reciever == null) {
            return sendResponse(res, statusCode.BAD_REQUEST, false, `User ${errorMessage.NOT_FOUND}`)
        }
        if (existFriendRequest) {
            return sendResponse(res, statusCode.BAD_REQUEST, false, `Friend Request ${errorMessage.ALREADY_EXIST}`)
        }
        else {
            const friendRequest = await FriendRequest.create(data)
            const senderUser = await User.findOneAndUpdate({ _id: senderUserId }, { $push: { friendRequestsSent: friendRequest._id } })
            await User.findOneAndUpdate({ _id: receiverUserId }, { $push: { friendRequestsReceived: friendRequest._id } })
            const result = await User.findOne({ _id: senderUserId },).populate('friendRequestsSent')
            return res.status(201).json({ message: "Request Send", result: result })

        }
    } catch (error) {
        console.log(error);
        return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, false, `User ${errorMessage.INTERNAL_SERVER}`, error)

    }
}

//update friend request 
exports.updateRequest = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const decoded = jwtDecode(token);
        const receiverUserId = decoded.id
        const senderUserId = req.body.id
        const status = req.body.status
        const friendRequestId = await FriendRequest.findOne({ $and: [{ senderUserId: senderUserId }, { receiverUserId: receiverUserId }, { status: 'pending' }] })

        if (friendRequestId) {
            if (status == "accepted") {
                const receiver = await User.findByIdAndUpdate(receiverUserId, {
                    $push: { friendsList: senderUserId },
                    $pull: { friendRequestsReceived: friendRequestId._id }
                });

                await User.findByIdAndUpdate(senderUserId, {
                    $push: { friendsList: receiverUserId },
                    $pull: { friendRequestsSent: friendRequestId._id }
                });
                await FriendRequest.findOneAndUpdate({ $and: [{ senderUserId: senderUserId }, { receiverUserId: receiverUserId }] }, { status: 'accepted' })
                return sendResponse(res, statusCode.OK, true, `Request Accepted`, receiver)
            }
            else if (status == "rejected") {
                const receiver = await User.findByIdAndUpdate(receiverUserId, {
                    $pull: { friendRequestsReceived: friendRequestId._id }
                });

                await User.findByIdAndUpdate(senderUserId, {
                    $pull: { friendRequestsSent: friendRequestId._id }
                });
                await FriendRequest.findOneAndUpdate({ $and: [{ senderUserId: senderUserId }, { receiverUserId: receiverUserId }] }, { status: 'rejected' })
                return sendResponse(res, statusCode.OK, true, `Request Rejected`)
            }
            return sendResponse(res, statusCode.BAD_REQUEST, false, `Request ${errorMessage.NOT_FOUND}`)

        }
        else {
            return sendResponse(res, statusCode.BAD_REQUEST, false, `Request ${errorMessage.NOT_FOUND}`)
        }


    } catch (error) {
        console.log(error);
        return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, false, `${errorMessage.INTERNAL_SERVER}`, error)

    }
}


exports.deleteRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const token = req.headers['authorization'];
        const decoded = jwtDecode(token);
        const senderUserId = decoded.id
        const friendRequestId = req.params.id
        const deletedRequest = await FriendRequest.findOneAndDelete({ _id: friendRequestId }, { session })
        console.log(deletedRequest, "deleted request")
        const updatedSender = await User.findOneAndUpdate(
            {
                _id: senderUserId,
            },
            {
                $pull: { friendRequestsSent: deletedRequest._id }
            },
            { session }
        );
        console.log(updatedSender, "updated sender")
        const updatedReceiver = await User.findOneAndUpdate(
            {
                _id: deletedRequest.receiverUserId,
            },
            {
                $pull: { friendRequestsReceived: deletedRequest._id }
            },
            { session }
        );
        if (updatedReceiver && updatedSender) {
            await session.commitTransaction();
            session.endSession();

            return sendResponse(res, statusCode.OK, true, `Request ${successMessage.DELETED}`)
        }

        await session.abortTransaction();
        session.endSession();
        return sendResponse(res, statusCode.BAD_REQUEST, false, `Request ${errorMessage.NOT_DELETED}`)

    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, false, `${errorMessage.INTERNAL_SERVER}`, error)

    }
}