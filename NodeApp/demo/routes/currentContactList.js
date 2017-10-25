/**
 * Created by Administrator on 2017/9/14.
 * 热聊界面的
 * 当前聊天的窗口
 */
var express = require("express");
var router = express.Router();
// 数据库
var mysql = require("../data/getContactList");
router.route("/")
    .post(function (req, res) {
        var herName = req.body.herName;
        var youName = req.body.youName;
        var getList = req.body.getList || "-";

        // 自己的当前聊天窗口添加
        var params = {
            database: youName,
            tableName: youName + "cc", // 保存当前聊天窗口的数据库
            checkPropertyValue : herName,
            checkProperty : "friendName",
            friendName: herName,
            relationship: 1, // 0 代表双方不是朋友，1 代表双方都是朋友，2代表有对方已添加你为朋友，3代表是你已添加对方为朋友
            headerTitleV: "id,friendName,relationship"
        }

        // 对方的当前聊天窗口添加
        var params1 = {
            database: herName,
            tableName: herName + "cc", // 保存当前聊天窗口的数据库
            checkPropertyValue : youName,
            checkProperty : "friendName",
            friendName: youName,
            relationship: 1, // 0 代表双方不是朋友，1 代表双方都是朋友，2代表有对方已添加你为朋友，3代表是你已添加对方为朋友
            headerTitleV: "id,friendName,relationship"
        }

        if (getList !== "add"){ // 默认获取表格
            mysql.tableALLData(function (msg) {
                res.send(msg.data);
            },params);
        } else {
            var sentClient = true;
            function tableInsert(p,oncall) {
                // 不存在，添加进去
                mysql.tableInsert(function (msg) {
                    if (msg.result === ""){
                        // 添加成功
                        // 1 用户名还不存在，添加到数据库中，并写入成功！
                        if (sentClient){res.json({result: "",sign: 1});}
                        oncall();
                    } else {
                        // 数据库出错
                        res.json(msg);
                    }
                },p);
            }
            mysql.checkCurrentData(function (msg) {
                if(msg.result === ""){
                    if (msg.isExist === 1){
                        // 已经存在了 当前名字
                        res.json({result: "",sign: 1});
                    } else {
                        tableInsert(params,function () {
                            sentClient = false;
                            tableInsert(params1,function () {});
                        });
                    }
                } else {
                    // 数据库报错了
                    res.json(msg);
                }
            },params);
        }
    });

module.exports = router;