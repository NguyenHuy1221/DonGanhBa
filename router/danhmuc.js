const express = require('express');
const danhmucRouter = express.Router();
const {
    getlistDanhMuc,
    createDanhMucCha,
    updateDanhMucCha,
    deleteDanhMucCha,
    createDanhMucCon,
    updateDanhMucCon,
    deleteDanhMucCon,
    getListDanhMucCon,
    } = require("../controller/danhmuc-controller")

    danhmucRouter.get('/getlistDanhMuc', async function (req, res) {
        return getlistDanhMuc(req, res);
    })
    
//danh muc cha
danhmucRouter.post('/createDanhMucCha', async function (req, res) {
    return createDanhMucCha(req, res);
})

danhmucRouter.put('/updateDanhMucCha/:id', async function (req, res) {
    return updateDanhMucCha(req, res);
})
danhmucRouter.delete('/deleteDanhMucCha/:id', async function (req, res) {
    return deleteDanhMucCha(req, res);
})

//danh muc con
danhmucRouter.get('/getListDanhMucCon/:IDDanhMucCha', async function (req, res) {
    return getListDanhMucCon(req, res);
})


danhmucRouter.post('/createDanhMucCon/:IDDanhMucCha', async function (req, res) {
    return createDanhMucCon(req, res);
})

danhmucRouter.put('/updateDanhMucCon/:IDDanhMucCha/:IDDanhMucCon', async function (req, res) {
    return updateDanhMucCon(req, res);
})
danhmucRouter.delete('/deleteDanhMucCon/:IDDanhMucCha/:IDDanhMucCon', async function (req, res) {
    return deleteDanhMucCon(req, res);
})



module.exports = danhmucRouter;