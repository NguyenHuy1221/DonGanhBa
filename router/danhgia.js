const express = require('express');
const DanhGiaRouter = express.Router();
const {
    getListDanhGiaInSanPhamById,
    createDanhGia,
    updateDanhGia,
    deleteDanhGia,
    addPhanHoi,
    updatePhanHoi,
    deletePhanHoi,
    updateLike, } = require("../controller/danhgia-controller")

DanhGiaRouter.get('/getListDanhGiaInSanPhamById/:IDSanPham/:userId', async function (req, res) {
    return getListDanhGiaInSanPhamById(req, res);
})


DanhGiaRouter.post('/createDanhGia', async function (req, res) {
    return createDanhGia(req, res);
})

DanhGiaRouter.post('/updateDanhGia/:danhGiaId', async function (req, res) {
    return updateDanhGia(req, res);
})

DanhGiaRouter.delete('/deleteDanhGia/:sanphamId/:danhGiaId', async function (req, res) {
    return deleteDanhGia(req, res);
})


DanhGiaRouter.post('/addPhanHoi/:danhGiaId', async function (req, res) {
    return addPhanHoi(req, res);
})

DanhGiaRouter.post('/updatePhanHoi/:danhGiaId/:phanHoiId', async function (req, res) {
    return updatePhanHoi(req, res);
})

DanhGiaRouter.delete('/deletePhanHoi/:phanHoiId', async function (req, res) {
    return deletePhanHoi(req, res);
})
DanhGiaRouter.put('/updateLike/:phanHoiId/:userId', async function (req, res) {
    return updateLike(req, res);
})




module.exports = DanhGiaRouter;