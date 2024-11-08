const express = require('express');
const thuoctinhRouter = express.Router();
const {
    getlistThuocTinh,
    createThuocTinh,
    updateThuocTinh,
    deleteThuocTinh,
    findThuocTinh,} = require("../controller/thuoctinh-controller")

    thuoctinhRouter.get('/getlistThuocTinh', async function (req, res) {
        return getlistThuocTinh(req, res);
    })
    

thuoctinhRouter.get('/findThuocTinh', async function (req, res) {
    return findThuocTinh(req, res);
})

thuoctinhRouter.post('/createThuocTinh', async function (req, res) {
    return createThuocTinh(req, res);
})

thuoctinhRouter.put('/updateThuocTinh:ThuocTinhID', async function (req, res) {
    return updateThuocTinh(req, res);
})
thuoctinhRouter.delete('/deleteThuocTinh/:ThuocTinhID', async function (req, res) {
    return deleteThuocTinh(req, res);
})




module.exports = thuoctinhRouter;