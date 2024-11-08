const express = require('express');
const yeuthichRouter = express.Router();
const {
    getListYeuThich,
    addToFavorites,
    getListYeuThichNopopulate, } = require("../controller/yeuthich-controller")

yeuthichRouter.get('/getListYeuThich/:userId', async function (req, res) {
    return getListYeuThich(req, res);
})
yeuthichRouter.get('/getListYeuThichNopopulate/:userId', async function (req, res) {
    return getListYeuThichNopopulate(req, res);
})

yeuthichRouter.put('/addToFavorites/:userId/:productId', async function (req, res) {
    return addToFavorites(req, res);
})





module.exports = yeuthichRouter;