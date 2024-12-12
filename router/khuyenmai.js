const express = require('express');
const khuyenmaiRouter = express.Router();
const {
    getlistKhuyenMai,
    createKhuyenMai,
    updateKhuyenMai,
    deleteKhuyenMai,
    getActiveKhuyenMai,
    getlistKhuyenMaiforadmin,
    getlistKhuyenMaiForWeb, } = require("../controller/khuyenmai-controller")

khuyenmaiRouter.get('/getlistKhuyenMai/:tongTien', async function (req, res) {
    return getlistKhuyenMai(req, res);
})
khuyenmaiRouter.get('/getlistKhuyenMaiForWeb/:tongTien', async function (req, res) {
    return getlistKhuyenMaiForWeb(req, res);
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

khuyenmaiRouter.get('/getlistKhuyenMaiforadmin', async function (req, res) {
    return getlistKhuyenMaiforadmin(req, res);
})


module.exports = khuyenmaiRouter;