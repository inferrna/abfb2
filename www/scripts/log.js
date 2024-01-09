define(
  ['cordova.js'],
  function(){
    host = "192.168.10.189";
    port = 1089;
    var exec = null;
    var callback = function(){};
    function tcpsend(arr){};
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
           tcpsend([host, port, "{\"message\": \""+encodeURIComponent(""+str)+"\", \"severity\": \""+severity+"\", \"caller\":\""+callerInfo+"\"}"]);
        } catch(e) {
            //console.warn(e);
        }
    }
    return {
        info:function(str){
            console.log(str);
            send_log(str, "info");
        },
        warn:function(str){
            console.warn(str);
            send_log(str, "warn");
        },
        error:function(str){
            console.error(str);
            send_log(str, "error");
        }
    };
  }
);
