const express = require('express');
const khuyenmaimanageRouter = express.Router();
const {
    
    getlistLoaiKhuyenMai,
    createLoaiKhuyenMai,
    updateLoaiKhuyenMai,} = require("../controller/Khuyenmai-manage-controller")

    // khuyenmaimanageRouter.get('/getlistThuocTinh', async function (req, res) {
    //     return getlistThuocTinh(req, res);
    // })
    

    khuyenmaimanageRouter.get('/getlistLoaiKhuyenMai', async function (req, res) {
    return getlistLoaiKhuyenMai(req, res);
})

khuyenmaimanageRouter.post('/createLoaiKhuyenMai', async function (req, res) {
    return createLoaiKhuyenMai(req, res);
})

khuyenmaimanageRouter.put('/updateLoaiKhuyenMai', async function (req, res) {
    return updateLoaiKhuyenMai(req, res);
})


module.exports = khuyenmaimanageRouter;