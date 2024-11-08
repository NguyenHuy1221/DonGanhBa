const express = require('express');
const bientheRouter = express.Router();
const {
    getlistBienTheByID,
    createBienTheInSanPham,
    updateBienTheInSanPham,
    deleteBienTheInSanPham,
    findBienTheInSanPham,
    findBienTheByIdSanPham, } = require("../controller/bienthe-controller")
bientheRouter.get('/getlistBienTheByID', async function (req, res) {
    return getlistBienTheByID(req, res);
})
bientheRouter.get('/findBienTheInSanPham', async function (req, res) {
    return findBienTheInSanPham(req, res);
})

bientheRouter.post('/createBienTheInSanPham', async function (req, res) {
    return createBienTheInSanPham(req, res);
})

bientheRouter.put('/updateBienTheInSanPham', async function (req, res) {
    return updateBienTheInSanPham(req, res);
})
bientheRouter.delete('/deleteBienTheInSanPham', async function (req, res) {
    return deleteBienTheInSanPham(req, res);
})
bientheRouter.get('/findBienTheByIdSanPham/:id', async function (req, res) {
    return findBienTheByIdSanPham(req, res);
})



module.exports = bientheRouter;