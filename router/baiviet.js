const express = require("express");
const baivietRouter = express.Router();

const {
    getListBaiViet,
    createBaiViet,
    updateBaiViet,
    updateLike,
    deleteBaiViet
} = require("../controller/baiviet-controller");

baivietRouter.get("/getListBaiViet/:userId", function (req, res) {
    return getListBaiViet(req, res);
});

baivietRouter.post("/createBaiViet", function (req, res) {
    return createBaiViet(req, res);
});

baivietRouter.put("/updateBaiViet/:baivietId", function (req, res) {
    return updateBaiViet(req, res);
});
baivietRouter.put("/updateLike/:baivietId/:userId", function (req, res) {
    return updateLike(req, res);
});
baivietRouter.delete("/deleteBaiViet/:baivietId", function (req, res) {
    return deleteBaiViet(req, res);
});

module.exports = baivietRouter;
