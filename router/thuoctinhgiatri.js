const express = require('express');
const thuoctinhgiatriRouter = express.Router();
const {
    getlistThuocTinhGiaTri,
    createThuocTinhGiaTri,
    updateThuocTinhGiaTri,
    deleteThuocTinhGiaTri,
    findThuocTinhGiaTri,} = require("../controller/thuoctinhgiatri-controller")

    thuoctinhgiatriRouter.get('/getlistThuocTinhGiaTri', async function (req, res) {
        return getlistThuocTinhGiaTri(req, res);
    })
    

    thuoctinhgiatriRouter.get('/findThuocTinhGiaTri/:ThuocTinhID', async function (req, res) {
    return findThuocTinhGiaTri(req, res);
})

thuoctinhgiatriRouter.post('/createThuocTinhGiaTri', async function (req, res) {
    return createThuocTinhGiaTri(req, res);
})

thuoctinhgiatriRouter.put('/updateThuocTinhGiaTri', async function (req, res) {
    return updateThuocTinhGiaTri(req, res);
})
thuoctinhgiatriRouter.delete('/deleteThuocTinhGiaTri', async function (req, res) {
    return deleteThuocTinhGiaTri(req, res);
})




module.exports = thuoctinhgiatriRouter;