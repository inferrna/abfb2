define(
  ['stuff', 'encod', 'cordova.js'],
  function(stuff, encod){
    var sockavail = null;
    var host = 'localhost';
    var port = 2628;
    var text = '';
    var word = '';
    var resp = '';
    var db = "!";
    var rcl = 0;
    var callback = function(){};
    console.log("Creating tcpecho.");
    function parse_resp(resp){
        if(resp.match(/.*552 no match.*/)){
            console.log(resp);
            if(rcl===0){rcl=1; get_matches();}
            else{rcl=0; callback("<b>"+word+"</b> not found.");}
        } else {
            /*resp = resp.replace("/\n/gm", "<br>");
            var reb = new RegExp(db, "gm");
            var rew = new RegExp(word, "gm");
            callback("<b>"+word+"</b> -> "+resp.replace(rew, "<br><b>-></b> ").replace(reb, ""));*/
            callback(resp);
        }
    }
    function get_matches(){
        var l = word.length;
        var cut = Math.floor(l/5);
        text = "MATCH "+db+" re ^.{0,"+cut+"}"+word.slice(cut, l-cut)+".{0,"+cut+"}$\n";
        console.log(text);
        if(sockavail === 'chrome') chromecreate();
        else if (sockavail === 'mozilla') mozopen();
        else if (sockavail === 'cordova') cordova_get(host, port, text);
        else console.log("Socket still unavailiable or check first");
    }
    function tcpecho(arr, callback){};
    try {
        var exec = cordova.require('cordova/exec');
        tcpecho = function(arr, callback) {
            exec(callback, function(err) {
                console.log("Got error: '"+err+"' while exec echo");
                callback("");
            }, "Echo", "echo", arr);
        };
        sockavail = 'cordova';
    } catch(e) { console.log("No cordova sockets available."); }
    
    function cordova_get(host, port, text){
        tcpecho([host, port, text], function(bindata) {
            //console.log("Got response.");
            parse_resp(encod.utf8b2str(bindata));
        });
    }
    function chromeconnect(id){  chrome.socket.connect(id, host, port, function(){
            window.setTimeout(function(){chromewrite(id, text);}, 128);
        }); 
    }
    function chromewrite(id, text){
        var data = encod.str2utf8b(text);
        //console.log(encod.utf8b2str(encod.str2utf8b("ползущий like окна")));
        chrome.socket.write(id, data, function(){window.setTimeout(function(writeInfo){chromeread(id);}, 384);});
    }
    function chromeread(id){  chrome.socket.read(id, 65536, function(readInfo){
            resp = encod.utf8b2str(readInfo.data);
            //console.log("Got from gsocket "+resp);
            chrome.socket.disconnect(id);
            chrome.socket.destroy(id);
            parse_resp(resp);
    }); }
    function chromecreate(){
        chrome.socket.create('tcp', null, function(createInfo){
                gsocketid = createInfo.socketId;
                //console.log("gsocketid==", gsocketid, "createInfo==", createInfo);
                chromeconnect(gsocketid);
            });
    }
    function mozopen(){
        resp = '';
        var mtext = text;
        var data = encod.str2utf8b(mtext);
        console.log("mtext is "+mtext);
        var moz_socket = navigator.mozTCPSocket.open(host, port, {binaryType: 'arraybuffer'});//'arraybuffer''string'
        moz_socket.onopen = function(e){
                moz_socket.send(data);
            };
        moz_socket.ondata = function(e){ moz_socket.suspend(); window.setTimeout(function(){ //Lag 256ms between data appears and receiving it.
                moz_socket.resume();
                var rettext = encod.utf8b2str(e.data);//String(e.data);
                if(rettext.substring(0,3)){//==='150'
                    resp += rettext;
                    parse_resp(resp);
                }else {
                    moz_socket.close();
                    //alert(rettext.substring(0,32)); 
                    //moz_socket.resume();
                }
            }, 256)};
    }
    return {
        get_def:function(_word, _clbck){
            callback = _clbck;
            word = _word;
            text = "DEFINE "+db+" "+word+"\n";
            console.log(text);
            if(sockavail === 'chrome') chromecreate();
            else if (sockavail === 'mozilla') mozopen();
            else if (sockavail === 'cordova') cordova_get(host, port, text);
            else console.log("Socket still unavailiable or check first");
        },
        get_dbs:function(_clbck){
            callback = _clbck;
            text = "SHOW DATABASES\n";
            if(sockavail === 'chrome') chromecreate();
            else if (sockavail === 'mozilla') mozopen();
            else if (sockavail === 'cordova') cordova_get(host, port, text);
            else console.log("Socket still unavailiable or check first");
        },
        check:function(){
            var _chrome = false;
            try{if(chrome.socket) _chrome = true;}
            catch(e){console.warn(e.stack); }
            if(navigator.mozTCPSocket){
                try{
                    navigator.mozTCPSocket.open('8.8.8.8', 53, {binaryType: 'arraybuffer'});
                    sockavail = 'mozilla';
                } catch(e) {console.log("navigator.mozTCPSocket present, but unaccessible");}
            }
            else if(_chrome) sockavail = 'chrome';
            console.log("sockavail=="+sockavail);
            return sockavail;
        },
        init:function(_host, _port, _db){
            if(sockavail===null){
                console.log("Socket unavailiable or check first");
                return;
            }
            host = _host;
            port = _port;
            db = _db;
        },
        response:function(){return resp;}
    };
  }
);
