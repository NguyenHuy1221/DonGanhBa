const express = require('express');
const yeucaudangkyRouter = express.Router();
const {
    createYeuCauDangKy
} = require("../controller/yeucaudangky")

yeucaudangkyRouter.post('/createYeuCauDangKy', async function (req, res) {
    return createYeuCauDangKy(req, res);
})






module.exports = yeucaudangkyRouter;