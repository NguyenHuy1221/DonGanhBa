const express = require('express');
const chatsocketRouter = express.Router();
const {
    Createconversation,
    getlistconversation,
    getlistconversation12,
} = require("../controller/chatsocket-controller")
chatsocketRouter.get('/getlistconversation/:sender_id', async function (req, res) {
    return getlistconversation(req, res);
})
chatsocketRouter.get('/getlistconversation12/:sender_id', async function (req, res) {
    return getlistconversation12(req, res);
})
chatsocketRouter.post('/Createconversation', async function (req, res) {
    return Createconversation(req, res);
})


module.exports = chatsocketRouter;