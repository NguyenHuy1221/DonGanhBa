const express = require("express");
const doanhthuRouter = express.Router();


const {
    GetDoanhThu,
    GetDoanhThu12,
} = require("../controller/doanhthu");

doanhthuRouter.get("/GetDoanhThu", function (req, res) {
    return GetDoanhThu(req, res);
});

doanhthuRouter.get("/GetDoanhThu12", function (req, res) {
    return GetDoanhThu12(req, res);
});



module.exports = doanhthuRouter;
