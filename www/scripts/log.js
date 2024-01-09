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
       const callerInfo = new Error().stack.split('\n').slice(3).map(function(s){return s.trim()}).join('<-');
       tcpsend([host, port, "{\"message\": \""+window.btoa(""+str)+"\", \"severity\": \""+severity+"\", \"caller\":\""+callerInfo+"\"}"]);
    }
    return {
        info:function(str){
            send_log(str, "info");
            console.log(str);
        },
        warn:function(str){
            send_log(str, "warn");
            console.warn(str);
        },
        error:function(str){
            send_log(str, "error");
            console.error(str);
        }
    };
  }
);
