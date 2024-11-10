const express = require("express");
const doanhthuRouter = express.Router();


const {
    GetDoanhThu
} = require("../controller/doanhthu");

doanhthuRouter.get("/GetDoanhThu", function (req, res) {
    return GetDoanhThu(req, res);
});



module.exports = doanhthuRouter;
