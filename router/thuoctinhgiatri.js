const express = require('express');
const thuoctinhgiatriRouter = express.Router();
const { checkPermissions } = require("../middleware/index")

const {
    getlistThuocTinhGiaTri,
    createThuocTinhGiaTri,
    updateThuocTinhGiaTri,
    deleteThuocTinhGiaTri,
    findThuocTinhGiaTri, } = require("../controller/thuoctinhgiatri-controller")

thuoctinhgiatriRouter.get('/getlistThuocTinhGiaTri/:userId', async function (req, res) {
    return getlistThuocTinhGiaTri(req, res);
})


thuoctinhgiatriRouter.get('/findThuocTinhGiaTri/:ThuocTinhID', async function (req, res) {
    return findThuocTinhGiaTri(req, res);
})

thuoctinhgiatriRouter.post('/createThuocTinhGiaTri', checkPermissions("giatrithuoctinh", "tao"), async function (req, res) {
    return createThuocTinhGiaTri(req, res);
})

thuoctinhgiatriRouter.put('/updateThuocTinhGiaTri', checkPermissions("giatrithuoctinh", "sua"), async function (req, res) {
    return updateThuocTinhGiaTri(req, res);
})
thuoctinhgiatriRouter.delete('/deleteThuocTinhGiaTri/:IDGiaTriThuocTinh', checkPermissions("giatrithuoctinh", "xoa"), async function (req, res) {
    return deleteThuocTinhGiaTri(req, res);
})




module.exports = thuoctinhgiatriRouter;