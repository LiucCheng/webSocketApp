/**
 * Created by Administrator on 2017/9/5.
 */
var mysql = require("mysql");
function mysql_check(oncall) {
    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : "user_info",
        port : "3306"
    });
    connection.connect();
    var GetSql = "SELECT * FROM userInfo";
    connection.query(GetSql, function (err, rows, field) {
        if (err) {
            console.log("err错误来了---:",err)
            return err;
        }
        oncall(rows);
    });
    connection.end(function (err) {
        if(err) return;
    });
}
function mysql_add(oncall, params) {
    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : "user_info",
        port : "3306"
    });
    connection.connect();
    var name = params.name,
        pwd = params.pwd,
        friend = params.friend || "",
        black_list = params.black_list || "",
        Id = Math.random() * 1000 + 1;
    var addSql = "INSERT INTO userInfo(Id, name, pwd, friend, black_list) VALUES("
        + Id + ", '" + name + "', '" + pwd + "', '" + friend + "', '" + black_list + "');";

    connection.query(addSql, function (err, rows, field) {
        console.log("addSqlerr错误来了---:",err);
        if (err) {
            oncall({result : "error: 添加数据库出现了问题！"});
            return err;
        }
        oncall({result : ""});
    });
    // var updataSql = "UPDATE 'user_info'.'userinfo' SET 'name' = 'Liucheng', 'pwd' = '123562', 'friend' = '008', 'black_list' = '120' WHERE 'Id' = 2";
    //
    // connection.query(updataSql, function (err, rows, field) {
    //     console.log("err错误来了---:",err);
    //     if (err) return err;
    //     console.log("uuuuuuuuuuuuuupdataSql:",rows);
    // });
    connection.end(function (err) {
        if(err) return;
    });
}

function mysql_remove(oncall,params) {
    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : "user_info",
        port : "3306"
    });
    connection.connect();
    var id = params.id;
    var name = params.name;
    var removeSql = "delete from userinfo WHERE userinfo.Id="+ id +" AND userinfo.name='" + name + "';";
    connection.query(removeSql, function (err, rows, field) {
        if (err) {
            console.log("数据库的错误来了---:",err);
            oncall({result : "error: 删除数据出现了错误！"});
            return err;
        }
        oncall({result : ""});
    });
    connection.end(function (err) {
        if(err) return;
    });
}




// module.exports = mysql_check;
exports.mysqlGetData = mysql_check;
exports.mysqlAddData = mysql_add;
exports.mysqlRemoveData = mysql_remove;

