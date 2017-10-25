/**
 * Created by Administrator on 2017/9/1.
 */
var express = require("express");
var router = express.Router();

// 数据库
var mysql = require("../data/getContactList");


router
    .route("/")
    .post(function (req, res) {
        var currName = req.body.name;
        var currPwd = req.body.pwd;
        var params = {
            database : "user_info",
            tableName : "userinfo",
            checkPropertyValue : currName,
            checkProperty : "name",
            isOnlyCheck : "1"
        }
        mysql.checkCurrentData(function (msg) {
            if (msg.result === ""){
                // 存在表格
                if (msg.isExist === 1){
                    if (msg.data[0].pwd === currPwd){
                        res.json({result: "",login_sign: 1,all_user: msg.data});
                    } else {
                        res.json({result: "", login_sign: 0});
                    }
                } else {
                    // 没有 找到
                    res.json({result: "", login_sign: 0});
                }
            } else {
                res.json({result: "", login_sign: 0});
            }
        },params);
    });

module.exports = router;