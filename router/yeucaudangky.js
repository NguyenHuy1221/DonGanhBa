const express = require('express');
const yeucaudangkyRouter = express.Router();
const { uploadmemory } = require("../untils/index")
const { checkPermissions } = require("../middleware/index")

const {
    createYeuCauDangKy,
    getListYeuCauDangKy,
    getYeuCauDangKyByUserId,
    updateYeuCauDangKy,
    getYeuCauDangKyDiaChiByUserId,
    updateDiaChiHoKinhDoanh,
} = require("../controller/yeucaudangky")

yeucaudangkyRouter.post('/createYeuCauDangKy', uploadmemory.single("file", 1), async function (req, res) {
    return createYeuCauDangKy(req, res);
})

yeucaudangkyRouter.get('/getListYeuCauDangKy', checkPermissions("yeucaudangky", "xem"), async function (req, res) {
    return getListYeuCauDangKy(req, res);
})
yeucaudangkyRouter.get('/getYeuCauDangKyByUserId/:userId', async function (req, res) {
    return getYeuCauDangKyByUserId(req, res);
})
yeucaudangkyRouter.put('/updateYeuCauDangKy/:yeuCauDangKyId', checkPermissions("yeucaudangky", "sua"), async function (req, res) {
    return updateYeuCauDangKy(req, res);
})

yeucaudangkyRouter.get('/getYeuCauDangKyDiaChiByUserId/:userId', async function (req, res) {
    return getYeuCauDangKyDiaChiByUserId(req, res);
})

yeucaudangkyRouter.post('/updateDiaChiHoKinhDoanh/:yeucaudangkyId', async function (req, res) {
    return updateDiaChiHoKinhDoanh(req, res);
})

module.exports = yeucaudangkyRouter;