const express = require('express');
const thuoctinhRouter = express.Router();
const { checkPermissions } = require("../middleware/index")

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

thuoctinhRouter.post('/createThuocTinh/:userId', checkPermissions("thuoctinh", "tao"), async function (req, res) {
    return createThuocTinh(req, res);
})

thuoctinhRouter.put('/updateThuocTinh/:id/:userId', checkPermissions("thuoctinh", "sua"), async function (req, res) {
    return updateThuocTinh(req, res);
})


thuoctinhRouter.put('/deleteThuocTinh/:id', checkPermissions("thuoctinh", "xoa"), async function (req, res) {
    return deleteThuocTinh(req, res);
})



module.exports = thuoctinhRouter;