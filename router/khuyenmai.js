const express = require('express');
const khuyenmaiRouter = express.Router();
const {
    getlistKhuyenMai,
    createKhuyenMai,
    updateKhuyenMai,
    deleteKhuyenMai,
    getActiveKhuyenMai } = require("../controller/khuyenmai-controller")

khuyenmaiRouter.get('/getlistKhuyenMai/:tongTien', async function (req, res) {
    return getlistKhuyenMai(req, res);
})

khuyenmaiRouter.post('/createKhuyenMai', async function (req, res) {
    return createKhuyenMai(req, res);
})

khuyenmaiRouter.put('/updateKhuyenMai/:id', async function (req, res) {
    return updateKhuyenMai(req, res);
})
khuyenmaiRouter.put('/getActiveKhuyenMai/:id', async function (req, res) {
    return getActiveKhuyenMai(req, res);
})
khuyenmaiRouter.delete('/deleteKhuyenMai/:id', async function (req, res) {
    return deleteKhuyenMai(req, res);
})




module.exports = khuyenmaiRouter;