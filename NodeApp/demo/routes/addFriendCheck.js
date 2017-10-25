/**
 * Created by Administrator on 2017/9/1.
 * 点击搜索对方的按钮操作
 */
var express = require("express");
var router = express.Router();
// 数据库
var mysql = require("../data/getContactList");


router
    .route("/")
    .post(function (req, res) {
        var currName = req.body.youName;
        var herName = req.body.herName;
        var sentClient = true;
        var params = {
            database : currName,
            tableName : currName,
            checkPropertyValue : herName,
            checkProperty : "friendName"
        }
        var subParams = {
            database : "user_info",
            tableName : "userinfo",
            checkPropertyValue : herName,
            checkProperty : "name",
            isOnlyCheck : "1" // 0 为有添加的步骤，1为单单检查数据
        }
        function checkCurrentData(p,oncall) {
            mysql.checkCurrentData(function (msg) {
                if (msg.result === ""){
                    if (msg.isExist === 1){
                        if (sentClient){ // 第一次查找返回
                            // 匹配到用户 ， 返回给客户端
                            res.json({result: "",found: 2});
                        } else {
                            // 在所有的用户里面匹配到当前用户，但是彼此还不是朋友
                            res.json({result: "",found: 1});
                        }
                    } else {
                        if (sentClient){
                            // 没有找到 ， 再去所有的用户信息里面查找是否存在当前用户
                            oncall();
                        } else {
                            // 在所有的用户里面未匹配到当前用户
                            res.json({result: "",found: 0});
                        }
                    }
                } else {
                    res.json(msg);
                }
            },p);
        }
        checkCurrentData(params,function () {
            sentClient = false;
            checkCurrentData(subParams);
        });

    });

module.exports = router;