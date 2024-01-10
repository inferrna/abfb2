define(
  ['cordova.js'],
  function(){
    host = "192.168.10.189";
    port = 1089;
    var exec = null;
    var callback = function(){};
    function tcpsend(arr){};
    var logs_enabled = true;
    try {
        exec = cordova.require('cordova/exec');
        tcpsend = function(arr) {
            exec(callback, function(err) {
                console.warn("Error calling cordova socket: "+err)
            }, "Echo", "tcpsend", arr);
        }
    } catch(e) { console.warn("No cordova sockets available."); }
    function send_log(str, severity) {
        var callerInfo = "";
        try {
            callerInfo = new Error().stack.split('\n').slice(3).map(function(s){return s.trim()}).join('<-');
        } catch(e) {
            //console.warn(e);
        }
        try {
           var data = "{\"message\": \""+encodeURIComponent(""+str)+"\", \"severity\": \""+severity+"\", \"caller\":\""+callerInfo+"\"}";
           tcpsend([host, port, data]);
        } catch(e) {
            //console.warn(e);
        }
    }
    return {
        info:function(str){
            if(logs_enabled) {
                console.log(str);
                send_log(str, "info");
            }
        },
        warn:function(str){
            if(logs_enabled) {
                console.warn(str);
                send_log(str, "warn");
            }
        },
        error:function(str){
            if(logs_enabled) {
                console.error(str);
                send_log(str, "error");
            }
        }
    };
  }
);
