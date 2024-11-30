const express = require("express");
const doanhthuRouter = express.Router();


const {
    GetDoanhThu,
    GetDoanhThu12,
    getData,
    getProductStatistics,
} = require("../controller/doanhthu");

doanhthuRouter.get("/GetDoanhThu", function (req, res) {
    return GetDoanhThu(req, res);
});

doanhthuRouter.get("/GetDoanhThu12/:userId", function (req, res) {
    return GetDoanhThu12(req, res);
});
doanhthuRouter.get("/getData/:userId", function (req, res) {
    return getData(req, res);
});
doanhthuRouter.get("/getProductStatistics", function (req, res) {
    return getProductStatistics(req, res);
});


module.exports = doanhthuRouter;
