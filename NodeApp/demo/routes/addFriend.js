/**
 * Created by Administrator on 2017/9/14.
 */
var express = require("express");
var router = express.Router();

var mysql = require("../data/getContactList");

// var http = require("http");
// var express = require("express");
// var app = express();
// var server = http.createServer(app);
// var io = require("socket.io").listen(server);

router.route("/")
    .post(function (req, res) {
        var herName = req.body.herName;
        var youName = req.body.youName;
        var params = {
            database: youName,
            tableName: youName,

            friendName: herName,
            checkPropertyValue : herName,
            checkProperty : "friendName",

            addWay: "账号搜索",
            relationship: 1, // 0 代表双方不是朋友，1 代表双方都是朋友，2代表有对方已添加你为朋友，3代表是你已添加对方为朋友
            headerTitleV: "id,friendName,addWay,relationship"
        };
        var subParams = {
            database: herName,
            tableName: herName,

            friendName: youName,
            checkPropertyValue : youName,
            checkProperty : "friendName",

            addWay: "账号搜索",
            relationship: 1, // 0 代表双方不是朋友，1 代表双方都是朋友，2代表有对方已添加你为朋友，3代表是你已添加对方为朋友
            headerTitleV: "id,friendName,addWay,relationship"
        }
        var sendClient = true;
        function addData(params,oncall) {
            mysql.checkCurrentData(function (msg) {
                if (msg.result === ""){
                    if (msg.isExist === 1){
                        if (sendClient){
                            // 双方已是好友了
                            res.json({result: "",found: 2});
                        }
                    } else {
                        // 不存在 , 两个账号添加进去
                        mysql.tableInsert(function (msg) {
                            if (msg.result === ""){
                                if (sendClient){
                                    // 添加成功
                                    res.json({result: "",found: 1});
                                    oncall();
                                } else {
                                    var receviedName = herName + "Add";
                                    // 通知 给客户端
                                    // gsocket.broadcast.emit(receviedName, {whoSend : youName,whoRecevied: herName});
                                }
                            } else {
                                if (sendClient){
                                    res.json(msg);
                                }
                            }
                        },params);
                    }
                } else {
                    if (sendClient){
                        // 数据库出错
                        res.json(msg);
                    }
                }

            },params);
        }
        addData(params,function () {
            sendClient = false;
            addData(subParams);
        })

    });

module.exports = router;
