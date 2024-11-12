const express = require("express");
const adminRouter = express.Router();
const UserModel = require("../models/NguoiDungSchema");


const {
    updateUserRoleAndPermissions,
    updateUserRoleAndPermissionsforuser
} = require("../controller/admin");

adminRouter.post("/updateUserRoleAndPermissions/:userId", function (req, res) {
    return updateUserRoleAndPermissions(req, res);
});
adminRouter.post("/updateUserRoleAndPermissionsforuser/:userId", function (req, res) {
    return updateUserRoleAndPermissionsforuser(req, res);
});



module.exports = adminRouter;
