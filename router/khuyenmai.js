const express = require('express');
const khuyenmaiRouter = express.Router();
const { checkPermissions } = require("../middleware/index")

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

khuyenmaiRouter.post('/createKhuyenMai', checkPermissions("khuyenmai", "tao"), async function (req, res) {
    return createKhuyenMai(req, res);
})

khuyenmaiRouter.put('/updateKhuyenMai/:id', checkPermissions("khuyenmai", "sua"), async function (req, res) {
    return updateKhuyenMai(req, res);
})
khuyenmaiRouter.put('/getActiveKhuyenMai/:id', checkPermissions("khuyenmai", "sua"), async function (req, res) {
    return getActiveKhuyenMai(req, res);
})
khuyenmaiRouter.delete('/deleteKhuyenMai/:id', checkPermissions("khuyenmai", "xoa"), async function (req, res) {
    return deleteKhuyenMai(req, res);
})

khuyenmaiRouter.get('/getlistKhuyenMaiforadmin', checkPermissions("khuyenmai", "xem"), async function (req, res) {
    return getlistKhuyenMaiforadmin(req, res);
})


module.exports = khuyenmaiRouter;