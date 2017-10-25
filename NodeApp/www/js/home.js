/**
 * Created by Administrator on 2017/9/6.
 */
$(function () {
    var current_pwd = "";
    var currentPwd = get_url_param("pwd");
    var currentUser = get_url_param("me");
    var gSocket = null;
    if (currentUser){
        currentPwd = decodeURI(currentPwd);
        currentUser = decodeURI(currentUser);
        $("#currentPwd").html(currentPwd);
         $("#currentUserName").html(currentUser);
        current_pwd = currentPwd;
        $(".loginView").remove();
    } else {
        var LView = loginView();
        $("#section_1").after(LView);
        var uname = "",upwd = "";

        if (typeof localStorage.getItem("RLUserName") !== "object") {
            uname = localStorage.getItem("RLUserName");
            upwd = localStorage.getItem("RLPwd");
        }
        if (localStorage.getItem("RLSave") === "0"){
            $(".remarkUserPwd ul li").css({left: -1});
            $(".remarkUserPwd").attr("data-save",0);
            $("#userName").val(uname);
            $("#userPwd").val("");
        } else {
            $(".remarkUserPwd").attr("data-save",1);
            $("#userName").val(uname);
            $("#userPwd").val(upwd);
        }
    }
    function loginView() {
        var loginView =
            '<section class="loginView">'
                + '<header>登录界面</header>'
            + '<div class="loginBox">'
            + '<div class="info">'
            + '<span>用户名 </span>'
            + '<input id="userName" placeholder="请输入用户名"/>'
            + '</div>'
            + '<div class="info">'
            + '<span>密码 </span>'
            + '<input id="userPwd" type="password" placeholder="请输入密码"/>'
            + '</div>'
            + '<div class="remarkUserPwd">'
                + '保存密码<ul class="save"><li></li><i class="left"></i><i class="right"></i></ul>'
            + '</div>'
            + '<div class="login_footer">'
            + '<a id="login">登录</a>'
            + '<a id="register">赶紧注册一个</a>'
            + '</div>'
            + '</div>'
            + '</section>';
        $("body").on("keydown", "#userPwd", function (e) {
            var value = $(this).val();
            value=value.replace(/[\u4E00-\u9FA5]/g,"");
            $(this).val(value);
        });

        $("body").on("keydown", function (e) {
            if (e.keyCode === 13){
                $("#login").trigger("click");
            }
        });

        $("body").on("click", "#login",function () {
            var userName = $("#userName").val();
            var userPwd =  $("#userPwd").val();
            $.trim(userName);
            $.trim(userPwd);
            if (!userName || !userPwd){
                alert("请输入登录的用户名和密码！");
                return;
            }
            localStorage.setItem("RLUserName",userName);
            if ($(".remarkUserPwd").attr("data-save") === "1"){
                localStorage.setItem("RLPwd",userPwd);
            } else {
                localStorage.removeItem("RLPwd");
            }
            var params = {
                name : userName,
                pwd : userPwd
            };
            $.ajax({
                url : "/login",
                type : "post",
                data : params,
                success : function (msg) {
                    if (msg.result === ""){
                        if (!msg.login_sign){
                            // 登录失败
                            alert("密码或用户名错误！");
                            localStorage.loginStatus = 0;
                        } else {
                            localStorage.loginStatus = "1";
                            localStorage.loginUser = userName;
                            localStorage.loginPwd = userPwd;
                            current_pwd = userPwd;
                            $("#currentPwd").html(userPwd);
                            $("#currentUserName").html(userName);
                            $(".footer_btn").eq(0).click();
                            client(userName);
                            var wWeight = $(window).width() / 100 + "rem";
                            $(".loginView").animate({left: wWeight},function () {
                                $(this).remove();
                            });
                        }
                    }
                }
            });
        });

        $("body").on("click", "#register",function () {
                var register =
                    '<section class="register">'
                    + '<header>'
                    + '<a class="back">返回</a>'
                    + '<span>注册界面</span>'
                    + '</header>'
                    + '<div class="loginBox">'
                    + '<div class="info">'
                    + '<span>用户名 </span>'
                    + '<input id="registerUserName" placeholder="请输入用户名"/>'
                    + '</div>'
                    + '<div class="info">'
                    + '<span>密码 </span>'
                    + '<input id="registerUserPwd" type="password" placeholder="请输入密码"/>'
                    + '</div>'
                    + '<div class="info">'
                    + '<span>确认密码 </span>'
                    + '<input id="registerUserPwdSure" type="password" placeholder="请输入密码"/>'
                    + '</div>'
                    + '<div class="register_footer">'
                    + '<a id="registeUser">注册</a>'
                    + '</div>'
                    + '</div>'
                    + '</section>';

            $("body").append(register);
            var wHeight = $(window).height() / 100 + 'rem';
            $(".register").css({top: wHeight});
            $(".register").animate({top : 0});
            $(".register .back").on("click", function () {
                $(".register").animate({top : wHeight},function () {
                    $(this).remove();
                });
            });
            $(".register #registeUser").off("click").on("click", function () {
                var userName = $("#registerUserName").val();
                var userPwd =  $("#registerUserPwd").val();
                var userPwdSure =  $("#registerUserPwdSure").val();
                $.trim(userName);
                $.trim(userPwd);
                if (!userName || !userPwd || !userPwdSure){
                    alert("请输入登录的用户名和密码！");
                    return;
                }
                if (userPwd !== userPwdSure){
                    alert("两次输入的密码对不上！");
                } else {
                    var params = {
                        name : userName,
                        pwd : userPwd
                    };
                    $.ajax({
                        url : "/regist",
                        type : "post",
                        data : params,
                        success : function (msg) {
                            if (msg.result === ""){
                                if (!msg.register_sign){
                                    alert("注册用户名已存在，请重试！");
                                } else {
                                    alert("注册成功");
                                    $("#userName").val(userName);
                                    $("#userPwd").val(userPwd);
                                    setTimeout(function () {
                                        $(".register").animate({top : wHeight},function () {
                                            $(this).remove();
                                        });
                                    },1000);
                                }
                            } else {
                                alert(msg.result);
                            }
                        }
                    });
                }
            });
        });

        $("body").on("click", ".remarkUserPwd ul", function () {
            // if (parseInt($(this).find("li").css("left")) > 0){
            if (typeof localStorage.getItem("RLSave") === "object" || localStorage.getItem("RLSave") === "1"){
                // 不保存
                $(this).find("li").animate({left: -1});
                $(this).parent("div").attr("data-save",0);
                localStorage.setItem("RLSave",0);
            } else if (localStorage.getItem("RLSave") === "0"){
                // 保存
                $(this).find("li").animate({left: '32%'});
                $(this).parent("div").attr("data-save",1);
                localStorage.setItem("RLSave",1);
            }
        })
        return loginView;
    }
    var newFriend = "";
    function client(currentUser) {
        var socket = io();
        var tipNum = 0;
        gSocket = socket;
        socket.on("connect",function () {
            socket.emit('join', currentUser);
        });
        socket.on(currentUser, function (msg) {
            // 本人收到的消息
            console.log("本人收到的消息：",msg);
            socket.emit("noRead", msg);
            for (var i = 0;i < $(".user_name").length; i++){
                if ($(".user_name").eq(i).html() === msg.user && msg.toUser === currentUser){
                    var num = $(".tip_num").eq(i).html();
                    num = parseInt(num);
                    num ++;
                    tipNum = num;
                    $(".tip_num").eq(i).html(num);
                    $(".tip_num").eq(i).show();
                }
            }
        });
        socket.on(currentUser + "Message", function (msg) {
            // 本人收到的消息
            console.log("MessageMessage",msg);
            var user_name = $(".user_name");
            var noTempContact = true;
            for (var i = 0;i < user_name.length;i++){
                if (user_name.eq(i).html() === msg.user){
                    noTempContact = false;
                }
            }
            if (noTempContact){
                $(".home_context .hot_contact").append("<li data-friendName='" + msg.user + "' data-me='" + msg.toUser + "'><span class='user_name'>" + msg.user + "</span><span class='tip_num'>1</span></li>");
                var length = $(".tip_num").length - 1;
                $(".tip_num").eq(length).show();
            }

        });
        socket.on(currentUser + "Add", function (msg) {
            // 本人收到的消息
            console.log("添加的消息Add",msg);
            if (msg.result === ""){
                newFriend = msg.whoSend;
                var num = $(".footer_btn").eq(1).find(".ctip").html();
                num = parseInt(num) + 1;
                $(".footer_btn").eq(1).find(".ctip").html(num);
                $(".footer_btn").eq(1).find(".ctip").show();
            }
        });

        socket.on("system", function (msg) {
            // 系统消息
            $.each($(".home_context ul.hot_contact li"),function(index,items){
                var $item = $(items);
                $item.find("span.online").remove();
                $item.find("span.offine").remove();
                $item.css({color: "#333"});
                for (var i = 0;i < msg.userArray.length;i ++){
                    if (msg.userArray[i] === $item.data("friendname")){
                        // 在线的用户
                        $item.append("<span class='online'>在线</span>");
                        $item.css({color: "lightgreen"});
                    }
                }
                if (!$item.find("span.online").hasClass("online")){
                    $item.append("<span class='offine'>离线</span>");
                    $item.css({color: "red"});
                }
            });
        });


        $(window).unload(function(){
            socket.emit("exit",currentUser);
        });

        $("body").on("click", "#sign_out", function () {
            localStorage.loginStatus = 0;
            socket.emit("exit",currentUser);
            location.href = "/home.html";
        });
    }

    if (location.search === ""){
        localStorage.loginStatus === "0";
    }
    
    function getContactList() {
        var currentUserName = $("#currentUserName").html();
        $.ajax({
            url : "/friendList",
            type : "post",
            data : {
                name : currentUserName
            },
            success : function (msg) {
                console.log(msg,"回调数据");
                $(".home_context .contacts_list").html("");
                for (var i = 0; i < msg.length; i++ ){
                    if (newFriend === msg.friendName){
                        $(".home_context .contacts_list").append("<li class='friendList' data-addWay='" + msg[i].addWay + "' data-friendName='" + msg[i].friendName + "'>" + msg[i].friendName + "<span class='newFriend'>新添加</span></li>");
                    } else if(msg[i].friendName === currentUserName){
                        $(".home_context .contacts_list").append("<li class='friendList' data-addWay='" + msg[i].addWay + "' data-friendName='" + msg[i].friendName + "'>" + msg[i].friendName + "<span class='currentUserShow'>当前用户</span></li>");
                    } else {
                        $(".home_context .contacts_list").append("<li class='friendList' data-addWay='" + msg[i].addWay + "' data-friendName='" + msg[i].friendName + "'>" + msg[i].friendName + "</li>");
                    }
                }
                var listzimu = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
                var zimu = '<div class="guide">';
                for(var j=0; j<listzimu.length; j++){
                    zimu+='<a href="#'+listzimu[j]+'">'+listzimu[j]+'</a>';
                }
                zimu += "</div>";
                $(".home_context").append(zimu);
                var height = $(".guide").height() / 26 / 100;

                $(".guide a").css({height: height + "rem"});

                $(".friendList").on("click",function () {
                    var addWay = $(this).data("addway");
                    var friendName = $(this).data("friendname");
                    var params = {
                        addWay : addWay,
                        friendName : friendName
                    }
                    friend_detail_page(params);
                });
            }
        });
    }

    function friend_detail_page(params) {
        var popSearchView =
            "<section class='detailView'>"
            + "<header><span class='back'>返回</span><span class='title'>详细资料</span></header>"
            + "<ul class='searchContent'>"
                + "<li id='friendName'>" + params.friendName + "</li>"
                + "<li><strong>添加方式：</strong><span>" + params.addWay + "</span></li>"
                + "<a class='sendMessage'>发消息</a>"
            + "</section>";
        $("body").append(popSearchView);

        // 移除
        $(".detailView .back").click(function () {
            $(".detailView").remove();
        });

        $(".sendMessage").on("click",function () {
            var contact_pes = $("#friendName").html();
            var me = $("#currentUserName").html();
            var noRead = 0;
            // 存入当前聊天窗口中 写入，需要传getList为false
            $.ajax({
                url : "/currentContactFriendList",
                type : "post",
                data : {
                    youName : me,
                    herName : params.friendName,
                    getList : "add"
                },
                success : function (msg) {
                    if (msg.result === ""){
                        location.href = "/contact.html?c=" + encodeURI(contact_pes) + "&me=" + encodeURI(me) + "&noRead=" + noRead;
                    }
                }
            });

        });
    }
    
    $(".footer_btn").on("click",function () {
        $(this).addClass("active").siblings(".footer_btn").removeClass("active");
        $(".home_context ul").hide();
        $(".guide").remove();
        if ($(this).find("span").html() === "热聊"){
            $(".home_header").html('热聊<a id="add_btn" class="add_btn"></a>');
            $(".home_context ul.hot_contact").show();
            getCurrentContactList();
        } else if ($(this).find("span.two").html() === "通讯录"){
            getContactList();
            $(".home_header").html("通讯录");
            $(".home_context ul.contacts_list").show();
            $(this).find(".ctip").html("0");
            $(this).find(".ctip").hide();
        } else if ($(this).find("span").html() === "发现"){
            $(".home_header").html("发现");
            $(".home_context ul.find_view").show();
        }else if ($(this).find("span").html() === "我"){
            $(".home_header").html("我");
            $(".home_context ul.me_detail").show();
        }
    });

    if (localStorage.loginStatus === "1"){
        $("#currentUserName").html(currentUser);
        client(currentUser);
        getCurrentContactList();
    }

    function getCurrentContactList() {
        // 获取当前聊天的列表
        var currentUserName = $("#currentUserName").html();
        $.ajax({
            url: "/currentContactFriendList",
            type: "post",
            data: {
                youName : currentUserName
            },
            success: function (msg) {
                $(".home_context .hot_contact").html("");
                appendHtml(msg,currentUserName);
            }
        });

    }

    function appendHtml(msg ,user) {
        var currentUserName = $("#currentUserName").html();
        for (var i = 0;i < msg.length;i++){
            if (user === msg[i].friendName){
                $("#currentUserName").html(user);
                // 当前用户
                $(".home_context .hot_contact").append("<li data-friendName='" + msg[i].friendName + "' data-me='" + currentUserName + "'><span class='user_name'>" + msg[i].friendName + "</span><span class='tip_num'>0</span><span class='mark_user'>当前用户</span></li>");
            } else {
                $(".home_context .hot_contact").prepend("<li data-friendName='" + msg[i].friendName + "' data-me='" + currentUserName + "'><span class='user_name'>" + msg[i].friendName + "</span><span class='tip_num'>0</span></li>");
            }
        }
        if (gSocket){
            gSocket.emit('join',currentUserName);
        }
    }

    $("body").on("click",".home_context ul.hot_contact li",function () {
        var contact_pes = $(this).find(".user_name").html();
        var me = $(".me_detail span").html();
        var noRead = $(this).find(".tip_num").html();
        location.href = "/contact.html?c=" + encodeURI(contact_pes) + "&me=" + encodeURI(me) + "&noRead=" + noRead;
    });

    /*长按事件开始*/
    var time = null;
    $("body").on('touchstart', '.home_context ul.hot_contact li', function(e){
        e.stopPropagation();
        var self = this;
        time = setTimeout(function(){
            chooseView(self);
        }, 1500);//这里设置长按响应时间
    });
    $("body").on('touchend', '.home_context ul.hot_contact li', function(e){
        e.stopPropagation();
        clearTimeout(time);
        time = null;
    });
    /*长按事件结束*/

    function chooseView(self) {
        var friendName = $(self).data("friendname");
        var me = $(self).data("me");

        var bgView = "<div class='bgView'></div>"
        var chooseView =
            "<ul class='chooseView'>"
                + "<li id='removeContact' data-friendName='" + friendName + "' data-me='" + me + "'>删除聊天</li>"
            + "</ul>";
        $("body").append(bgView);
        $(self).append(chooseView);

        $("#removeContact").click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var self = this;
            var herName = $(this).data("friendname");
            var youName = $(this).data("me");
            // 移除哪个数据库
            $.ajax({
                url: "/removeTableData",
                type: "post",
                data: {
                    youName : youName,
                    herName : herName
                },
                success: function (msg) {
                    if (msg.result === ""){
                        $(".chooseView").parent().remove();
                        $(self).remove();
                        $(".chooseView").remove();
                    } else {
                        alert(msg.result);
                    }
                }
            });

        });
        $(".bgView").click(function (e) {
            $(this).remove();
            $(".chooseView").remove();
        });
    }

    $("section").on("click", "#add_btn", function () {
        var userName = $("#userName").val();
        var userPwd =  $("#userPwd").val();
        $.trim(userName);
        $.trim(userPwd);

        var popSearchView =
            "<section class='popSearchView'>"
               + "<header><span class='back'>返回</span><input id='searchUserName' type='search' placeholder='请输入对方的用户名'/><a id='searchBtn'>搜索</a></header>"
               + "<ul class='searchContent'></ul>"
            + "</section>";
        $("body").append(popSearchView);

        // 移除
        $(".popSearchView .back").click(function () {
            $(".popSearchView").remove();
        });

        $("#searchUserName").keydown(function (e) {
            if (e.keyCode === 13){
                $(".popSearchView #searchBtn").trigger("click");
            }
        });

        $(".popSearchView #searchBtn").click(function () {
            var currentUserName = $("#currentUserName").html();
            var searchUserName =  $("#searchUserName").val();
            if (!searchUserName){
                alert("请输入对方用户名");
                return;
            }
            console.log(searchUserName)
            $.ajax({
                url : "/addFriendCheck",
                type : "post",
                data : {
                    youName: currentUserName,
                    herName : searchUserName
                },
                success : function (msg) {
                    console.log(msg,"回调数据");
                    if (msg.result === ""){
                        // 查到有此人，但还不是朋友关系
                        if(msg.found === 1){
                            $(".popSearchView .searchContent").html("<li><span>" + searchUserName + "</span><a class='addFriend'>添加为好友</a></li>");
                            // 点击了添加好友
                            $(".addFriend").on("click",function () {
                                var self = $(this);
                                $.ajax({
                                    url: "/addFriend",
                                    type: "post",
                                    data: {
                                        herName: searchUserName,
                                        youName : currentUserName
                                    },
                                    success: function (msg) {
                                        if (msg.result === ""){
                                            alert("添加成功！");
                                            self.html("你们已是好友啦！");
                                            self.parent("li").addClass("alreadFriendLi");
                                            self.addClass("alreadFriend").removeClass("addFriend");
                                            self.off("click");
                                        }
                                    }
                                })
                            })
                        } else if (msg.found === 2){ // 查到此人已是朋友关系
                            $(".popSearchView .searchContent").html("<li class='alreadFriendLi'><span>" + searchUserName + "</span><a class='alreadFriend'>你们已是好友啦！</a></li>");
                        } else { // 没有查到此人
                            $(".popSearchView .searchContent").html("<li class='noData'>没有搜索到！</li>")
                            alert("没有搜索到该用户！",1000);
                        }
                    } else {
                        $(".popSearchView .searchContent").html("<li class='noData'>没有搜索到！</li>")
                        alert("没有搜索到该用户！",1000);
                    }
                    $("body").off("click").on("click",".alreadFriendLi", function () {
                        var currentUserName = $("#currentUserName").html();
                        var herName = $(".alreadFriendLi span").html();
                        $.ajax({
                            url: "/checkUserInfo",
                            type: "post",
                            data: {
                                youName : currentUserName,
                                herName : herName
                            },
                            success: function (msg) {
                                friend_detail_page({
                                    addWay : msg.data[0].addWay,
                                    friendName : msg.data[0].friendName
                                });
                            }
                        });
                    });
                }
            });
        });
    });
});