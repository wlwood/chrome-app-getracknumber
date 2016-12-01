



var server_ip = "52.90.164.20";

var login_url = "http://" + server_ip + "/Client/Login/Admin/";
var  track_nums_url = "http://" + server_ip + "/client/get_tracknum_urls/";

var status = "0";
var get_time = 20 * 1000;
var restart_time = 1800 * 1000;


function find_tracknumber(source_code){
   // var cssselect = "div#mainContent.sm-er.row > div > h1" ;
   console.log(source_code) ;
   var reges = new RegExp('"trackingNumber\"\:"([\\s\\S]*?\)"', "g");
   console.log(reges)
   var track_number = source_code.match(reges);
   console.log(track_number);
   if (track_number == null){
        track_number = "";
   }else{
        try{
            track_number = track_number[0].split(":")[1];
            track_number = track_number.replace("\"", "").replace("\"", "");
        }catch(e){
            track_number = ""; 
        }
   }
   //console.log(track_number);

    var shipping_carrier_reges = new RegExp('"shippingCarrier\"\:"([\\s\\S]*?\)"', "g"); 
    var shipping_carrier = source_code.match(shipping_carrier_reges);
    if (shipping_carrier == null){
        shipping_carrier = "";
    }else{
        try{
            shipping_carrier = shipping_carrier[0].split(":")[1];
            shipping_carrier = shipping_carrier.replace("\"", "").replace("\"", "");
        }catch(e){
            shipping_carrier = ""; 
        }
    }
    //console.log(shipping_carrier);
    return {"track_number": track_number, "shipping_carrier": shipping_carrier};
}



function Login(){
    var post_dict = {"username":"root", "password": "Starmerx2016"};
    $.ajax({
        url: login_url,
        type: "POST",
        data: post_dict,
        dataType: "json",
        success: function(sdata){
            console.log(sdata);
        },error: function(edata){
            track_number = "loginError";
            shipping_carrier = "";
            console.log(edata);
        }
    });
}


function get_pages(url){
    console.log("get url:"+url);
    pages = "";
    $.ajax({
        url: url,
        //async: false,
        type: "GET",
        success: function(page_code){
            //find_tracknumber(pages);
            pages = page_code;
            //console.log(pages);
            //return pages;
            callback(pages);
        },error: function (data){
            console.log(data);
            //pages = data;
            //return pages;
            callback(pages);
        }
    });
}


function loopPost(post_Json){

}

function loopStart(infoData){
    if (infoData.length >= 0){
        var track_nums_list = [];
        $.each(infoData, function(index, value){
            var page_url =  value.track_number_url;

            //console.log(value);
             return_json = find_tracknumber(get_pages(page_url));
             return_json.id = value.id;
             return_json.track_number_url = page_url;
             track_nums_list.push(return_json);
         });
        if (track_nums_list.length > 0){
            var post_Json = JSON.stringify({"result_json":track_nums_list});
            //console.log(post_Json);
            //console.log(typeof post_Json);
            $.ajax({
                url: track_nums_url,
                type: "POST",
                data: post_Json,
                dataType: "json",
                success: function(sdata){
                    console.log(sdata);
                }, error: function(edata){
                    console.log(edata);
                }
            });
        }else{
            var track_number_url = "http://www.ebay.com/"
            console.log(track_number_url)
            //find_tracknumber(get_pages("http://www.baidu.com"));
            //var return_json =  async.compose(find_tracknumber, get_pages(track_number_url))
            //var a = 10;
            async.waterfall([
                function(callback){
                    //var pages = get_pages(track_number_url)
                    pages = "";
                    $.ajax({
                        url: track_number_url,
                        //async: false,
                        type: "GET",
                        success: function(page_code){
                            //find_tracknumber(pages);
                            pages = page_code;
                            //console.log(pages);
                            //return pages;
                            callback(null,pages);
                        },error: function (data){
                            console.log(data);
                            //pages = data;
                            //return pages;
                            callback(null,pages);
                        }
                    });                    
                    //callback(null, pages);
                    /*
                    console.log("get pages ...")
                        if(a == 0){
                            callback(new Error("a 不能为0"));
                        }else{
                            var b = 1/ a;
                            console.log(b);
                            callback(null, b);
                        }
                      */
                }, function(b, callback){
                    /*
                    console.log("get c");
                    var c = b +1;
                    console.log(c);
                    callback(null, c);
                    */
                    track_number = find_tracknumber(pages);
                    console.log(track_number);
                    callback(null, track_number)
                }
            ], function(err, result){
                if (err){
                    console.log('1.1 err: ', err);
                } else {
                    console.log("c:" + result)
                }
            });
            console.log("not data ...");
        }
    }else{
        console.log("not found login, go to login ...");
        Login(); 
    }
}

function main(autokey){
    //console.log("main start ...");
    status = "1";
    $.ajax({
        url: track_nums_url,
        type: "GET",
        data: {"autokey": autokey},
        dataType: "json",
        success:function(infoData){
            //console.log(infoData);
            loopStart(infoData);
        },error: function (edata){
            loopStart(edata);
            console.log(edata);
        }
    });
}


function getTrack_numbers(autokey){
    console.log("start ...");
    console.log(autokey);
    var interval = window.setInterval(function(){
        if (localStorage.status == '0'){
            console.log(localStorage.status);
            window.clearInterval(interval);
        }
        main(autokey);
    },  get_time);
}



setInterval(function(){
    if (localStorage.autokey != "" && localStorage.autokey != undefined){
        var autokey = localStorage.autokey.trim();
        if(status == "0"){
            getTrack_numbers(autokey);
            localStorage.setItem("status", "1");
        }else{
            console.log("running ...");
        }
    }else{
        console.log("not autokey...");
    }
}, restart_time);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
    msg = message.msg;
    autokey = message.autokey;
    if (msg == "Start"){
        if(localStorage.status == "1"){
            console.log("already running ...");
        }else{
            getTrack_numbers(autokey);
            localStorage.setItem("status", "1");
        }
        sendResponse("running ....");
    }else{
        sendResponse("not running...");
    }
});











