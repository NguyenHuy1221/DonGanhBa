const express = require('express');
const zalopayRouter = express.Router();
const {
    getListYeuThich,
    addToFavorites,
    getListYeuThichNopopulate, } = require("../controller/yeuthich-controller")

zalopayRouter.get('/getListYeuThich/:userId', async function (req, res) {
    return getListYeuThich(req, res);
})
zalopayRouter.get('/getListYeuThichNopopulate/:userId', async function (req, res) {
    return getListYeuThichNopopulate(req, res);
})

zalopayRouter.put('/addToFavorites/:userId/:productId', async function (req, res) {
    return addToFavorites(req, res);
})





module.exports = zalopayRouter;