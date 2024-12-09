const express = require('express');
const yeucaudangkyRouter = express.Router();
const {
    createYeuCauDangKy,
    getListYeuCauDangKy,
    getYeuCauDangKyByUserId,
    updateYeuCauDangKy,
    getYeuCauDangKyDiaChiByUserId,
    updateDiaChiHoKinhDoanh,
} = require("../controller/yeucaudangky")

yeucaudangkyRouter.post('/createYeuCauDangKy', async function (req, res) {
    return createYeuCauDangKy(req, res);
})

yeucaudangkyRouter.get('/getListYeuCauDangKy', async function (req, res) {
    return getListYeuCauDangKy(req, res);
})
yeucaudangkyRouter.get('/getYeuCauDangKyByUserId/:userId', async function (req, res) {
    return getYeuCauDangKyByUserId(req, res);
})
yeucaudangkyRouter.put('/updateYeuCauDangKy/:yeuCauDangKyId', async function (req, res) {
    return updateYeuCauDangKy(req, res);
})

yeucaudangkyRouter.get('/getYeuCauDangKyDiaChiByUserId/:userId', async function (req, res) {
    return getYeuCauDangKyDiaChiByUserId(req, res);
})

yeucaudangkyRouter.post('/updateDiaChiHoKinhDoanh/:yeucaudangkyId', async function (req, res) {
    return updateDiaChiHoKinhDoanh(req, res);
})

module.exports = yeucaudangkyRouter;