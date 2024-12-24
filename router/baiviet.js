const express = require("express");
const baivietRouter = express.Router();
const { uploadmemory } = require("../untils/index")
const { checkPermissions, authenticateUser } = require("../middleware/index")

const {
    getListBaiViet,
    createBaiViet,
    updateBaiViet,
    updateLike,
    deleteBaiViet,
    getBaiVietById,
    addBinhLuan,
    updateBinhLuan,
    deleteBinhLuan,
    getListBaiVietAdmin,
    getListBaiVietTheoDoi,
    countUserPosts,
} = require("../controller/baiviet-controller");

baivietRouter.get("/getListBaiVietAdmin/:userId", checkPermissions("baiviet", "xem"), function (req, res) {
    return getListBaiVietAdmin(req, res);
});
baivietRouter.get("/getListBaiViet/:userId", function (req, res) {
    return getListBaiViet(req, res);
});
baivietRouter.get("/getBaiVietById/:userId", function (req, res) {
    return getBaiVietById(req, res);
});
baivietRouter.get("/getListBaiVietTheoDoi/:userId", function (req, res) {
    return getListBaiVietTheoDoi(req, res);
});
baivietRouter.get("/countUserPosts/:userId", function (req, res) {
    return countUserPosts(req, res);
});

baivietRouter.post("/createBaiViet", uploadmemory.array("files", 10), function (req, res) {
    return createBaiViet(req, res);
});

baivietRouter.put("/updateBaiViet/:baivietId", uploadmemory.array("files", 10), function (req, res) {
    return updateBaiViet(req, res);
});
baivietRouter.put("/updateLike/:baivietId/:userId", function (req, res) {
    return updateLike(req, res);
});
baivietRouter.delete("/deleteBaiViet/:baivietId", function (req, res) {
    return deleteBaiViet(req, res);
});

// , checkPermissions("baiviet", "xoa")
baivietRouter.post("/addBinhLuan/:baivietId", function (req, res) {
    return addBinhLuan(req, res);
});
baivietRouter.put("/updateBinhLuan/:baivietId/:binhLuanId", function (req, res) {
    return updateBinhLuan(req, res);
});
baivietRouter.delete("/deleteBinhLuan/:baivietId/:binhLuanId", function (req, res) {
    return deleteBinhLuan(req, res);
});



module.exports = baivietRouter;
