/**
 * Created by Administrator on 2017/8/28.
 */
const http = require("http");
const https = require("https");
const express = require("express");
const url = require("url");
const path = require("path");
const fs = require("fs");
const logger = require('morgan');
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

// 解析body的参数，form表单提交等 上传
const multiparty = require("connect-multiparty");
const multipartyMiddleware = multiparty();

const querystring = require('querystring');
const app = express();

// post 请求用到
const bodyParser = require("body-parser");

const regist = require("./routes/regist");
const login = require("./routes/login");
const addFriendCheck = require("./routes/addFriendCheck");
const addFriend = require("./routes/addFriend");
const friendList = require("./routes/getContactList");
const currentContactFriendList = require("./routes/currentContactList");
const checkUserInfo = require("./routes/checkUserInfo");
const removeTableData = require("./routes/removeTableData");
const room = require("./routes/room");
const WebSocket = require("ws");

// 数据库
const mysql = require("./data/getContactList");

const privateKey  = fs.readFileSync('./demo/key/private.key', 'utf8');
const certificate = fs.readFileSync('./demo/key/certificate.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const server = http.createServer(app);
const httpsserver = https.createServer(credentials,app);

// webSoket
const io = require("socket.io").listen(server);
const httpsio = require("socket.io").listen(httpsserver);
const httpPORT = 8888;
const httpsPORT = 8887;

// ws
var ws = new WebSocket.Server({ server : server });
ws.on('connection', function (ws, req) {
    console.log(ws.name,"名字",req);
    ws.on('message', function (msg) {
        console.log('ws received: %s', msg);
        ws.send(msg);
    });
});

// wss
var wss = new WebSocket.Server({ server : httpsserver });
wss.on('connection', function (ws, req) {
    ws.on('message', function (msg) {
        console.log('wss received:', msg ," ms=",ws);
        ws.send(msg);
    });
});

// 设置日志级别
// io.set('lig level', 1);

var showTime = true;
setInterval(function () {
    showTime = true;
},50000);
var noReadMsg = [];
var roomArray;
var onlineArray = [];

// remove value in array
Array.prototype.removeItem = function(val) {
    for(var i = 0;i < this.length;i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}

function notiFriendInfo(msg,socket) {
    // 查看对方在不在当前聊天的窗口
    var params = {
        database: msg.toUser,
        tableName: msg.toUser + "cc",
        checkPropertyValue : msg.user,
        checkProperty : "friendName",

        friendName: msg.user,
        relationship: 1, // 0 代表双方不是朋友，1 代表双方都是朋友，2代表有对方已添加你为朋友，3代表是你已添加对方为朋友
        headerTitleV: "id,friendName,relationship"
    }
    mysql.checkCurrentData(function (data) {
        if (data.result === ""){
            if (data.isExist === 1){
                // 存在
                socket.broadcast.emit(msg.toUser + "Message",msg);
            } else {
                // 不存在  添加到表格中去
                mysql.tableInsert(function (data) {
                    if (data.result === ""){
                        // 添加成功
                        socket.broadcast.emit(msg.toUser + "Message",msg);
                    }
                },params);
            }

        }
    },params);
}

// web socket 链接监听 http
io.on('connection', function (socket) {
    console.log("链接成功")
    // 打印握手信息
    // 构造客户端对象
    socket.on('message', function (msg) {
        notiFriendInfo(msg, socket);
        // 间隔显示时间：
        if (showTime) {
            msg.time = +new Date();
        } else {
            msg.time = false;
        }
        showTime = false;

        // 返回消息（可以省略）
        // 发给对方的用户
        socket.broadcast.emit(msg.toUser, msg);
        msg.me = true;
        // 发给自己的消息
        socket.emit(msg.user, msg);
    });
    socket.on("noRead", function (msg) {
        noReadMsg.push(msg);
        console.log(noReadMsg,"未读写入文件的");

    });
    socket.on("read", function () {
        for (var i = 0;i < noReadMsg.length; i++){
            socket.emit(noReadMsg[0].toUser, noReadMsg[i]);
        }
        noReadMsg = [];
    });
    socket.on("exit", function (msg) {
        msg = msg || null;
        if (onlineArray.indexOf(msg) !== -1 && msg !== null){
            // 存在当前用户，去掉改用户的在线状态
            onlineArray.removeItem(msg);
            socket.emit("system",  {result: "",userArray: onlineArray,status: 1});
            socket.broadcast.emit("system",  {result: "",userArray: onlineArray,status: 1});
        }
    });

    // 监听退出事件
    socket.on('disconnect', function (msg) {
        console.log("退出链接");
    });
});

// web socket 链接监听 https
httpsio.on('connection', function (socket) {

    // 和客户端连接的通知
    socket.on('join', function (msg) {
        if (typeof msg === "undefined" || msg === null) return;
        roomArray = msg || null;
        if (onlineArray.indexOf(msg) === -1) {
            // 不存在当前用户，添加进去
            onlineArray.push(msg);
        }
        // 发给自己一份
        socket.emit("system", {result: "", userArray: onlineArray, status: 1});
        // 发给除了自己 一份
        socket.broadcast.emit("system", {result: "", userArray: onlineArray, status: 1});
    });

    // 构造客户端对象
    socket.on('message', function (msg) {
        notiFriendInfo(msg, socket);
        // 间隔显示时间：
        if (showTime) {
            msg.time = +new Date();
        } else {
            msg.time = false;
        }
        showTime = false;

        // 返回消息（可以省略）
        // 发给对方的用户
        socket.broadcast.emit(msg.toUser, msg);
        msg.me = true;
        // 发给自己的消息
        socket.emit(msg.user, msg);
    });
    socket.on("noRead", function (msg) {
        noReadMsg.push(msg);
        console.log(noReadMsg,"未读写入文件的");

    });
    socket.on("read", function () {
        for (var i = 0;i < noReadMsg.length; i++){
            socket.emit(noReadMsg[0].toUser, noReadMsg[i]);
        }
        noReadMsg = [];
    });
    socket.on("exit", function (msg) {
        msg = msg || null;
        if (onlineArray.indexOf(msg) !== -1 && msg !== null){
            // 存在当前用户，去掉改用户的在线状态
            onlineArray.removeItem(msg);
            socket.emit("system",  {result: "",userArray: onlineArray,status: 1});
            socket.broadcast.emit("system",  {result: "",userArray: onlineArray,status: 1});
        }
    });

    // 监听退出事件
    socket.on('disconnect', function (msg) {
        socket.emit("退出监听",msg);
    });
});

// express 基本配置
app.use(logger('dev'));

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride(function (req, res) {
    if (req.body && typeof  req.body === 'object' && '_method' in req.body){
        // look in url encoded Post bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}))

// 静态文件
app.use(express.static(path.join(__dirname, '../www')));

app.get("/", function (req, res, next) {
    res.sendFile(path.join(__dirname, '../www/test.html'),function () {});
});

app.use("/regist", regist);
app.use("/login", login);
// 检查是否有朋友
app.use("/addFriendCheck", addFriendCheck);
// 添加朋友操作
app.use("/addFriend", addFriend);
// 获取已添加朋友的列表
app.use("/friendList", friendList);
// 获取当前聊天的朋友列表
app.use("/currentContactFriendList",currentContactFriendList);
// 获取一个朋友的信息，并返回
app.use("/checkUserInfo",checkUserInfo);
// 移除数据库表中的数据
app.use("/removeTableData",removeTableData);

/**
 * Get port from environment and store in Express.
 */
// var port = normalizePort(process.env.PORT || 8888);
// app.set('port', port);
server.listen(httpPORT, function () {
    console.log("已监听",httpPORT);
});
// https
httpsserver.listen(httpsPORT, function () {
    console.log("已监听",httpsPORT);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
