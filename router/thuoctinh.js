const express = require('express');
const thuoctinhRouter = express.Router();
const {
    getlistThuocTinh,
    createThuocTinh,
    updateThuocTinh,
    deleteThuocTinh,
    findThuocTinh, } = require("../controller/thuoctinh-controller")

thuoctinhRouter.get('/getlistThuocTinh/:userId', async function (req, res) {
    return getlistThuocTinh(req, res);
})


thuoctinhRouter.get('/findThuocTinh', async function (req, res) {
    return findThuocTinh(req, res);
})

thuoctinhRouter.post('/createThuocTinh/:userId', async function (req, res) {
    return createThuocTinh(req, res);
})

thuoctinhRouter.put('/updateThuocTinh/:id/:userId', async function (req, res) {
    return updateThuocTinh(req, res);
})


thuoctinhRouter.put('/deleteThuocTinh/:id', async function (req, res) {
    return deleteThuocTinh(req, res);
})



module.exports = thuoctinhRouter;