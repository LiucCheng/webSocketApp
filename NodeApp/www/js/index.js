/**
 * Created by Administrator on 2017/8/28.
 */
$(function () {
    //将form中的值转换为键值对
    function getFormJson(frm){
        var temp={};
        var a=$(frm).serializeArray();
        $.each(a,function(){
            if(temp[this.name]!==undefined){
                if(!temp[this.name].push){
                    temp[this.name]=[temp[this.name]];
                }
                temp[this.name].push(this.value || '');
            }else{
                temp[this.name]=this.value || '';
            }
        });
        return temp;
    }

    $(document).keydown(function (e) {
        if (e.keyCode == 13){
            $("#send1").trigger("click");
        }
    });
    var toUser = get_url_param("c") || "数据有问题";
    var currentUser = get_url_param("me") || "";
    var noRead = get_url_param("noRead") || 0;
    toUser = decodeURI(toUser);
    currentUser = decodeURI(currentUser);
    noRead = parseInt(noRead);

    function connect_server(currentUser) {
        $("header .contact_people").html(toUser);

        function receviedMsg(msg) {
            var className = "me"
            if (msg.user !== currentUser){
                className = "other";
            }
            if (msg.user != toUser && !msg.me) return;
            var time = "";
            if (msg.time){
                //yyyy-MM-dd hh:mm:ss
                var dateFormatStr = dateFormat(new Date(msg.time), "hh:mm:ss");
                time = "<div class='showTime'><span>" + dateFormatStr + "</span></div>";
            }
            var text =
                time
                + "<li class='" + className + "'>"
                + "<span>" + msg.user.substr(1,2) + "</span>"
                + "<span>" + msg.message + " </span>"
                + "</li>";
            $("#text_show1 ul").append(text);
            $("#text_show1").scrollTop($("#text_show1 ul").height());
        }

        // 用户
        var socket = io();
        // var socket = io.connect('http://192.168.2.11:8888');

        /*
        // 连接通知
        socket.on("connect",function () {
            var json = {
                formUser : currentUser,
                toUser : toUser
            }
            socket.emit('join', json);
        })

        // 系统消息
        socket.on("systemMsg",function (msg) {
            console.log(msg,"systemMsg");
        })

        // 本人收到的消息
        socket.on("receivedMsg",function (msg) {
            console.log(msg,"receivedMsg");
        });

        // 发送的消息
        $("#send1").on("click", function () {
            var input = $("#send_text1").val();
            if (!input){
                alert("请输入内容！");
                return;
            };
            socket.emit("message",{
                user: currentUser,
                toUser : toUser,
                message : input
            });
            $("#text_show1").scrollTop($("#text_show1 ul").height());
            $("#send_text1").val("");
        });
        */

        // 连接通知
        // socket.on("connect",function () {
        //     var json = {
        //         user : currentUser,
        //         toUser : toUser
        //     }
        //     socket.emit('join', json);
        // });

        socket.on("connect",function () {
            socket.emit('join', currentUser);
        });

        // 监听system事件
        socket.on("system", function (msg) {
            console.log(msg,"system信息回调");
            var cusr = $(".nav_header span.contact_people").html();
            var online = false;
            $(".nav_header").find("span.status").remove();
            for (var i = 0;i < msg.userArray.length;i++){
                if (cusr === msg.userArray[i]){// 在线的
                    $(".nav_header").append("<span class='status'>（在线）</span>");
                    online = true;
                }
            }
            if (!online){
                $(".nav_header").append("<span class='status'>（离线）</span>");
            }
        });
        // 当前用户的系统信息
        socket.on(currentUser + "system", function (msg) {
            console.log(msg,"当前用户的系统信息");
        });

        socket.on(currentUser, function (msg) {
            // 本人收到的消息
            console.log("本人收到的消息：",msg);
            receviedMsg(msg);
        });
        if (noRead){
            console.log("触发了",noRead);
            socket.emit("read");
        }
        $("#send1").on("click", function () {
            var input = $("#send_text1").val();
            if (!input){
                alert("请输入内容！");
                return;
            };
            socket.emit("message",{
                user: currentUser,
                toUser : toUser,
                message : input
            });
            $("#text_show1").scrollTop($("#text_show1 ul").height());
            $("#send_text1").val("");
        });
        $("#send_text1").focus(function () {
            console.log("dddd")
            $("#text_show1").scrollTop($("#text_show1 ul").height());
        });
        $(window).unload(function(){
            socket.emit("exit",currentUser);
        });

    }


    connect_server(currentUser);
    $(".back").click(function () {
        var params = changeUrlParam("noRead",0);
        location.href = "/home.html" + params;
    });

    $("#sure").click(function () {
        var val = $("#userName").val();
        if (!val) {alert("请输入用户名"); return;}
        connect_server(val);
        $(".popView").remove();
    });


})