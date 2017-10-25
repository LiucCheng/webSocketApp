// 获取房间的
var express = require("express");
var router = express.Router();

router
    .route("/")
    .get(function (req, res) {
        var currName = req.query.formU;
        var currPwd = req.query.toU;
    });

module.exports = router;