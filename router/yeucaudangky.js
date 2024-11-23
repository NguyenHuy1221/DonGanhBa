const express = require('express');
const yeucaudangkyRouter = express.Router();
const {
    createYeuCauDangKy,
    getListYeuCauDangKy,
    getYeuCauDangKyByUserId,
    updateYeuCauDangKy,
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




module.exports = yeucaudangkyRouter;