const express = require("express");
const adminRouter = express.Router();
const UserModel = require("../models/NguoiDungSchema");


const {
    updateUserRoleAndPermissions,
    updateUserRoleAndPermissionsforuser,
    getListThongBaoAdmin,
    createThongBao,
} = require("../controller/admin");

adminRouter.post("/updateUserRoleAndPermissions/:userId", function (req, res) {
    return updateUserRoleAndPermissions(req, res);
});
adminRouter.post("/updateUserRoleAndPermissionsforuser/:userId", function (req, res) {
    return updateUserRoleAndPermissionsforuser(req, res);
});

adminRouter.get("/getListThongBaoAdmin", function (req, res) {
    return getListThongBaoAdmin(req, res);
});
adminRouter.post("/createThongBao", function (req, res) {
    return createThongBao(req, res);
});

module.exports = adminRouter;
