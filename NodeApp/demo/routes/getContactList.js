/**
 * Created by Administrator on 2017/9/12.
 */

// 获取通讯录的 界面
var express = require("express");
var router = express.Router();

// 数据库
var mysql = require("../data/getContactList");

router
    .route("/")
    .post(function (req, res) {
        var currName = req.body.name;
        var params = {
            database : currName,
            tableName : currName
        }
        mysql.tableALLData(function (msg) {
            if (msg.result === ""){
                res.send(msg.data);
            } else {
                res.send(msg);
            }
        },params);
    });
module.exports = router;