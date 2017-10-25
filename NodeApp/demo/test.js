
var clients = []; // 存储所有连接的用户
const WebSocket = require('ws');
const url = require("url");
const wss = new WebSocket.Server({ port: 8886 });

// Broadcast to all.
wss.broadcast = function broadcast(data,req) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            console.log(client.procotol)
            client.send(data);
        }
    });
};
wss.on('connection', function (ws,req) {
    const location = url.parse(req.url, true);
    clients.push(ws);
    console.log("------------",clients.length);
    ws.on('message', function (data) {
        // Broadcast to everyone else.
        // console.log(location,location.query.name);
        console.log("------------",data,clients.length);
        for (var i = 0; i < clients.length;i++){
            // clients[i].send(data);
        }
        // wss.broadcast(data);
    });
    ws.on('data', function (data) {
        console.log("------------",data);
    });
});
console.log("完成");
