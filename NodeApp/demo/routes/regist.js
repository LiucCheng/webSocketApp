/**
 * Created by Administrator on 2017/9/4.
 */
var express = require("express");
var router = express.Router();
var fs = require("fs");

var returnClient = true;
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
                name : currName,
                pwd : currPwd,
                headerTitleV : "id,name,pwd"
            }

            // 查重操作
            function checkRepeat(params,oncall) {
                mysql.checkCurrentData(function (msg) {
                    if (msg.result === ""){
                        if (msg.isExist === 1){
                            // 存在了当前数据
                            // 返回客户端 0 代表 用户名重复了，请重试！
                            if (returnClient){
                                res.json({result: "",register_sign: 0});
                            }
                        } else {
                            // 不存在当前数据 , 添加当前数据到数据库中
                            inserData(params,oncall);
                        }
                    }else {
                        // 还没创建数据库
                        if (returnClient){res.json(msg);}
                    }
                },params);
            }


            // 向表单中注入数据
            function inserData(params,oncall) {
                // 创建数据库表单成功，直接添加
                mysql.tableInsert(function (msg) {
                    if (msg.result === ""){
                        // 添加成功  注册成功
                        if (returnClient){
                            res.json({result: "",register_sign: 1});
                        }
                        oncall({result : ""});
                    } else {
                        if (returnClient){res.json(msg);}
                    }
                },params);
            }

            // 直接 创建表单
            function createTable(params,oncall) {
                mysql.createTable(function (msg) {
                    if (msg.result === ""){
                        // 创建数据库表单成功，直接添加
                        inserData(params,oncall);
                    }else {
                        if (returnClient){res.json(msg);}
                    }
                },params);
            }

            // 检查 表单
            function checkTable(params,oncall) {
                mysql.checkTableIsExist(function (msg) {
                    if (msg.result === ""){
                        if (msg.isExist === 0){
                            // 不存在数据库表单，要进行创建数据库表单
                            createTable(params,oncall);
                        } else {
                            // 存在数据库表单 ，查 重
                            checkRepeat(params,oncall);
                        }
                    } else {
                        if (returnClient){res.json(msg);}
                    }
                },params);
            }

            // 开始的地方
            function begin(params,oncall) {
                mysql.checkDatabasesIsExist(function (msg) {
                    if (msg.result === ""){
                        if (msg.isExist === 0){
                            // 未创建数据库 要进行创建
                            mysql.creatDatabase(function (msg) {
                                if (msg.result === ""){
                                    createTable(params,oncall);
                                } else {
                                    if (returnClient){res.json(msg);}
                                }
                            },params);
                        } else {
                            // 已经存在了,检查表格是否存在
                            checkTable(params,oncall);
                        }
                    } else {
                        if (returnClient){res.json(msg);}
                    }
                },params);
            }

            returnClient = true;
            begin(params,function (msg) {
                returnClient = false;
                // 成功时候的回调
                if (msg.result === ""){
                    // 添加 自己为好友
                    var subParam0 = {
                        database : currName,
                        tableName : currName,
                        friendName : currName,
                        addWay : "我是你自己",
                        relationship: 1, // 0 代表双方不是朋友，1 代表双方都是朋友，2代表有对方已添加你为朋友，3代表是你已添加对方为朋友
                        headerTitleV: "id,friendName,addWay,relationship"
                    };
                    // 添加临时会话窗口
                    var subParam1 = {
                        database : currName,
                        tableName : currName + "cc",
                        friendName : currName,
                        relationship: 1, // 0 代表双方不是朋友，1 代表双方都是朋友，2代表有对方已添加你为朋友，3代表是你已添加对方为朋友
                        headerTitleV: "id,friendName,relationship"
                    };
                    begin(subParam0,function () {
                        begin(subParam1,function () {});
                    });


                }
            });
        });
module.exports = router;