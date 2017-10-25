/**
 * Created by Administrator on 2017/9/14.
 */

// 移除数据库表中的数据
var express = require("express");
var router = express.Router();
var fs = require("fs");
var mysql = require("../data/getContactList");
router
    .route("/")
    .post(function (req, res) {
        var youName = req.body.youName;
        var herName = req.body.herName;
        console.log(youName,herName);
        var params = {
            database : youName,
            tableName : youName + "cc",
            removePropertys : "friendName",
            removePropertyValue : herName
        }
        mysql.removeTableData(function (msg) {
            console.log("gg",msg);
            if (typeof msg.result !== "undefined" && msg.result === ""){
                // 删除成功
                res.json(msg);
            } else {
                // 删除失败
                res.json({result : "err: 删除过程出现错误！"});
            }
        },params);

    });
module.exports = router;