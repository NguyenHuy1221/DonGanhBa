const express = require('express');
const diachiRoute = express.Router();
const {
    getDiaChiByUserId,
    createDiaChi,
    updateDiaChi,
    deleteDiaChi
    } = require("../controller/diachi-controller")


diachiRoute.get("/getDiaChiByUserId/:userId", function (req, res) {
    return getDiaChiByUserId(req, res);
      });
diachiRoute.post("/createDiaChi/:userId", function (req, res) {
    return createDiaChi(req, res);
});
diachiRoute.post('/updateDiaChi/:userId/:diaChiId', async function (req, res) {
    return updateDiaChi(req, res);
})
diachiRoute.delete('/deleteDiaChi/:userId/:diaChiId', async function (req, res) {
    return deleteDiaChi(req, res);
})
module.exports = diachiRoute;