/**
 * Created by Administrator on 2017/9/14.
 */
// 查看一个用户的信息，并返回用户信息
var express = require("express");
var router = express.Router();

// 数据库
var mysql = require("../data/getContactList");

router.route("/")
    .post(function (req, res) {
        var youName = req.body.youName;
        var herName = req.body.herName;
        var subParams = {
            database : youName,
            tableName : youName,
            checkPropertyValue : herName,
            checkProperty : "friendName"
        }
        mysql.checkCurrentData(function (msg) {
            res.json(msg);
        },subParams);
    });

module.exports = router;