const express = require("express");
const doanhthuRouter = express.Router();


const {
    GetDoanhThu,
    GetDoanhThu12,
    getData,
} = require("../controller/doanhthu");

doanhthuRouter.get("/GetDoanhThu", function (req, res) {
    return GetDoanhThu(req, res);
});

doanhthuRouter.get("/GetDoanhThu12", function (req, res) {
    return GetDoanhThu12(req, res);
});
doanhthuRouter.get("/getData", function (req, res) {
    return getData(req, res);
});



module.exports = doanhthuRouter;
