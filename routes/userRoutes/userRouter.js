const express = require("express");

const router = express.Router()
const userController = require("../../controller/user/userController.js")
const passport = require('passport')
//validations
const { userSchema } = require('../../validators/userSchema.js')
const { validate } = require('../../validators/userValidator.js')

//users
router.get("/user-details", passport.authenticate('jwt', { session: false }), userController.getUser)
router.get("/list", passport.authenticate('jwt', { session: false }), userController.listUser)
//authentication
router.post("/signup", validate(userSchema), userController.createUser)
router.post("/login", userController.loginUser)
//friend request
router.post("/request-send",passport.authenticate('jwt', { session: false }), userController.sendRequest)
router.put("/update-request/",passport.authenticate('jwt', { session: false }), userController.updateRequest)
router.delete('/delete-request/:id',passport.authenticate('jwt', { session: false }), userController.deleteRequest)


module.exports = router