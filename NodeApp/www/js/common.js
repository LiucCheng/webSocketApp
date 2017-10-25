/**
 * Created by Administrator on 2017/9/6.
 */

window.alert = function (text, times) {
    $(".mytips,.shield").remove();
    times = times || 1500;
    //text = text.replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g, '<br>');
    var mytips = '<div class="mytips"><i class="bj"></i><p>' + text + '</p></div>';
    $("body").append('<i class="shield"></i>');
    $("body").append(mytips);
    var box = $(".mytips");
    var w = box.width();
    var h = box.height();
    box.css({"margin-left": -w / 2, "margin-top": -h / 2, "position": "fixed",zIndex:99999999});
    setTimeout(function () {
        $(".mytips,.shield").remove();
    }, times);
};


function changeUrlParam(name,value) {
    var url=window.location.search;
    var newUrl="";
    var reg = new RegExp("(^|)"+ name +"=([^&]*)(|$)");
    var tmp = name + "=" + value;
    if(url.match(reg) != null)
    {
        newUrl= url.replace(eval(reg),tmp);
    }
    else
    {
        if(url.match("[\?]"))
        {
            newUrl= url + "&" + tmp;
        }
        else
        {
            newUrl= url + "?" + tmp;
        }
    }
     return newUrl;
}

function get_url_param(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null) return r[2];
    // unescape(r[2]);
    return null;
};

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

function dateFormat(date, format) {
    var o = {
        "M+": date.getMonth() + 1, //month
        "d+": date.getDate(),    //day
        "h+": date.getHours(),   //hour
        "m+": date.getMinutes(), //minute
        "s+": date.getSeconds(), //second
        "q+": Math.floor((date.getMonth() + 3) / 3),  //quarter
        "S": date.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

function deepCopy(source) {
    var result={};
    for (var key in source) {
        result[key] = typeof source[key]==='object'? deepCopy(source[key]): source[key];
    }
    return result;
}

// remove value in array
Array.prototype.removeItem = function(val) {
    for(var i = 0;i < this.length;i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}