

function init(){
    
    if (localStorage.autokey != ""){
        var autokey = localStorage.autokey;
    }else{
        var autokey = "";
    }
    if(autokey != ""){
        var autokey = localStorage.autokey;
        $("#autokey_div").empty();
        $("#autokey_div").text(autokey);
    }else{
        $("#autokey_div").empty();
        $("#autokey_div").text("");
    }
    if (localStorage.status == "1"){
        $("#statue_div").empty();
        $("#statue_div").text("正在运行..");
        $("#autoButton").text("停 止");
    }else{
        $("#statue_div").empty();
        $("#statue_div").text("");
        $("#autoButton").text("开 始");
    }
}


function showMesg(msg){
    var options={
        //dir: "ltr",  //控制方向，据说目前浏览器还不支持
        lang: "utf-8",
        //icon: "http://ihuster.com/static/avatar/m_default.png",
        body: msg,
        tag: "soManyNotification"
    };
    Notification.permission = "granted";
    var notifi = new Notification("提醒", options);

}

function send_start(send_message){
    chrome.runtime.sendMessage(send_message, function(response){
        init();
    });
}

$(document).ready(function (){
    init();
    $("#autoButton").click(function(){
        if (localStorage.status == "1"){
            console.log("go to stop ...");
            localStorage.setItem("status", "0");
            init();

        }else{
            var autokey = $("#autokey_id").val();
            if (autokey.trim() != ""){
                localStorage.setItem("autokey", autokey);
                var send_message = {"autokey":autokey, "msg": "Start"};
                send_start(send_message);
            }else{
                if (localStorage.autokey != "" && localStorage.autokey != undefined){
                    var autokey = localStorage.autokey;
                    var send_message = {"autokey":autokey, "msg": "Start"};
                    send_start(send_message);
                }else{
                    alert("请输入是哪台机器!");
                    //showMesg("请输入这是哪台机器!");
                }
            }
        }
    });

    $("#stop_id").click(function(){
        localStorage.setItem("status", "0");
        init();
    });

});
