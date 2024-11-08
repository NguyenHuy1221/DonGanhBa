const express = require("express");
const adminRouter = express.Router();
const UserModel = require("../models/NguoiDungSchema");


const {
    updateUserRoleAndPermissions
} = require("../controller/admin");

adminRouter.post("/updateUserRoleAndPermissions/:userId", function (req, res) {
    return updateUserRoleAndPermissions(req, res);
});



module.exports = adminRouter;
