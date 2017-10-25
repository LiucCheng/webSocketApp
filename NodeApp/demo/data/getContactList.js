/**
* 说明
* 报错：返回 {result : "err : ..."},
* 已经存 ： 返回 { result : "" , isExist : 1 , info: "说明"};(数据库)  || { result : "" , isExist : 1, info: "说明"，data: rows}; （数据表）
* 不存在 ： 返回 { result : "" , isExist : 0 , info: "说明"}
 * info值：noData(有表格，但是没有找到对应的数据), noTable（未创建数据表单），noDatabase(未创建数据库);
 *        creatSus(创建成功)
 * 在查找特定数据库是否存在的时候是不返回 data值的
 *
 * 操作数据库流程：       ————————————————————————————————————————————————————————————————————
 *                     |                   |                 |                             |
 * 检查当前数据库是否存在 ---> （存在）检查数据库表是否存在 ----> （存在数据库表）检查值是否存在  ----> 返回；
 *                      |
 *                      ---> （不存在创建数据库）检查数据库表是否存在 ----> （不存在数据库表）检查值是否存在  ----> 返回；
* */
var mysql = require("mysql");

// 检查数据库是否存在
function checkDatabasesIsExist(oncall, params) {
    var database = params.database;
    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        port : "3306"
    });
    connection.connect();
    var checkSql = "SELECT * FROM information_schema.SCHEMATA where SCHEMA_NAME='" + database + "'";
    connection.query(checkSql, function (err, rows, field) {
        if (err){
            oncall({result: "err: 查找数据库出现问题！"});
            return;
        }
        if (rows.length === 0){
            oncall({result: "", isExist : 0, info : "noDatabase"}); // 未创建数据库
        } else {
            // 存在了数据库
            oncall({result: "", isExist : 1, info : ""});
        }
    });


}

// 不存在的情况，创建数据库
function creatDatabase (oncall,params) {
    var database = params.database;
    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        port : "3306"
    });
    connection.connect();

    var GetSql =
        "CREATE DATABASE IF NOT EXISTS " + database + " CHARACTER SET UTF8;";
    connection.query(GetSql, function (err, rows, field) {
        if (err) {
            // 数据库语法有问题
            oncall({result : "err: 数据库创建错误！", err: err});
            return err;
        }
        // 创建数据库成功
        oncall({result: "", isExist : 1});
    });
    connection.end();
}

// 检验数据库中的数据表 是否 存在
function checkTableIsExist(oncall,params) {
    var database = params.database;
    var tableName = params.tableName;

    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });
    connection.connect();
    var GetSql =
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='" + database + "' AND TABLE_NAME='" + tableName + "';";
    // "SELECT * FROM " + tableName;
    connection.query(GetSql, function (err, rows, field) {
        if (err) {
            // 语法有问题
            oncall({result : "err: 检查数据库表单存在的时候出现错误！", err: err});
            return err;
        }
        if (rows.length === 0){
            // 不存在当前数据库表格  就要进行创建数据库表单
            oncall({result: "", isExist : 0, info : "noTable"});
        } else {
            // 存在了数据库
            oncall({result: "", isExist : 1, info : ""});
        }

    });
    connection.end();
}

// 创建数据库中的表格
function createTable (oncall,params) {
    var database = params.database;
    var tableName = params.tableName;
    var headerTitleV = params.headerTitleV || "";

    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });

    connection.connect();
    var objKey = headerTitleV.split(",");
    var list = "";
    for (var i = 0;i < objKey.length;i++){
        if (objKey[i] === "id"){
            list += objKey[i] + " INT UNSIGNED NOT NULL AUTO_INCREMENT,";
        } else {
            list += objKey[i] + " varchar(30) NOT NULL,";
        }
    }
    var createSql = "CREATE TABLE " + tableName + "(" + list + "PRIMARY KEY (" + objKey[0] + "));";
    connection.query(createSql,function (err, rows, field) {
        if (err) {
            oncall({result : "error: 创建数据表单的时候的过程出现了问题！",err : err});
            return err;
        }
        // 创建数据库表单成功：
        oncall({result: "", isExist : 1});
    });
}

// 数据库存在 且 数据库表格也存在 进行的 插入操作
function tableInsert(oncall, params) {
    var database = params.database;
    var tableName = params.tableName;
    var headerTitleV = params.headerTitleV || "";
    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });
    connection.connect();
    var objKey = params.headerTitleV.split(",");
    var objValueArray = [];
    for (var i = 0;i < objKey.length;i++){
        if (objKey[i] === "id"){
            var num = 'NULL';
            objValueArray.push(num);
            continue;
        }
        var temp = params[objKey[i]] || '';
        objValueArray.push("\'"+temp+"\'");
    }
    var value = objValueArray.join(",");
    var addSql = "INSERT INTO " + tableName + "("+ headerTitleV +") VALUES(" + value + ");";

    connection.query(addSql, function (err, rows, field) {
        if (err) {
            oncall({result : "error: 添加数据库出现了问题！",err : err});
            return err;
        }
        // 添加成功
        oncall({result: "", isExist : 1});
    });
    connection.end();
}

// 检查数据库表中的某个字段值是否存在
function checkCurrentData(oncall,params) {
    var database = params.database;
    var tableName = params.tableName;
    var checkProperty = params.checkProperty || "-";
    var checkPropertyValue = params.checkPropertyValue || "-";

    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });
    connection.connect();
    var checkSql = "SELECT * from " + tableName + " WHERE " + checkProperty + "='" + checkPropertyValue + "'";
    connection.query(checkSql, function (err, rows, field) {
        if (err) {
            // 查找数据库表的时候出现了问题;
            oncall({result: "err: 查找数据库表的时候出现了问题", err: err}); // 返回未创建数据库
            return;
        }
        if (rows.length === 0){ // 没有查找到
            // 有表格，但是没有找到
            oncall({result : "", isExist: 2, info:"noData", data : rows});
        } else {
            // 已经存在当前查找的数据库在数据中：
            oncall({result : "", isExist: 1, info:"", data : rows});
        }
    });
    connection.end();
}

// 返回该表格的所有数据
function tableALLData(oncall,params) {
    var database = params.database;
    var tableName = params.tableName;

    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });
    connection.connect();
    var GetSql = "SELECT * FROM " + tableName;
    connection.query(GetSql, function (err, rows, field) {
        if (err) {
            oncall({result:"err: 数据库查找出现问题",err : err});
            return
        }
        if (rows.length === 0){
            // 存在表格，不存在数据
            oncall({result:"",isExist : 0,data: rows});
        } else {
            oncall({result:"",isExist : 1,data: rows});
        }
    });
    connection.end();
}



// 移除表格中的某个数据
function mysql_remove(oncall,params) {
    var database = params.database;
    var tableName = params.tableName;
    var removePropertys = params.removePropertys;
    var removePropertyValue = params.removePropertyValue;

    console.log(removePropertys,removePropertyValue,"----------------------------------")
    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });
    connection.connect();

    var removeSql = "delete from " + tableName + " WHERE "+ removePropertys +"='"+ removePropertyValue +"'";
    // var removeSql = "delete from " + tableName + " WHERE userinfo.Id="+ id +" AND userinfo.name='" +  name + "';";
    connection.query(removeSql, function (err, rows, field) {
        if (err) {
            console.log("数据库的错误来了---:",err);
            oncall({result : "error: 删除数据出现了错误！"});
            return err;
        }
        oncall(rows);
    });
    connection.end();
}
// 排序将新的数据排到第一行
function selectOne(oncall, params) {
    var database = params.database;
    var tableName = params.tableName;
    var removePropertys = params.removePropertys;
    var removePropertyValue = params.removePropertyValue;

    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });
    connection.connect();
    // 获取第一行的数据：
    var removeSql = "delete from " + tableName + " limit 1";
    connection.query(removeSql, function (err, rows, field) {
        if (err) {
            console.log("数据库的错误来了---:",err);
            oncall({result : "error: 删除数据出现了错误！"});
            return err;
        }
        changeData(oncall, params,rows);
    });
    connection.end();
}
// // 交换数据
function changeData(oncall, params, data) {
    var database = params.database;
    var tableName = params.tableName;
    var changePropertys = params.changePropertys;
    var changePropertysValue = params.changePropertysValue;

    var connection = mysql.createConnection({
        host: "localhost",
        user : "root",
        password : ".lc123456",
        database : database,
        port : "3306"
    });
    connection.connect();


    // 修改第一行的数据：
    var removeSql = "update " + tableName + " set " + changePropertys + "=" + changePropertysValue;
    // update lcc set friendName = "fhy",relationship='1111'  where friendName = 'fhy' AND relationship='1';
    connection.query(removeSql, function (err, rows, field) {
        if (err) {
            console.log("数据库的错误来了---:",err);
            oncall({result : "error: 删除数据出现了错误！"});
            return err;
        }
        oncall(rows);
    });
    connection.end();
}


// 检查数据库：
exports.checkDatabasesIsExist = checkDatabasesIsExist;

// 不存在 就 创建数据库
exports.creatDatabase = creatDatabase;

// 有数据库之后，检查数据库表是否存在
exports.checkTableIsExist = checkTableIsExist;

// 不存在 就 创建数据库中的表格：
exports.createTable = createTable;

// 返回表格中的所有数据
exports.tableALLData = tableALLData;

// 以上满足， 进行插入表格操作
exports.tableInsert = tableInsert;

// 以上都满足的情况下 就可以 检查特定的属性值是否相等
exports.checkCurrentData = checkCurrentData;




// 返回该表格的所有数据
exports.tableALLData = tableALLData;

// 移除表格中的某个数据
exports.removeTableData = mysql_remove;


