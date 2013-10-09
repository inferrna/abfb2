define(
  ['stuff', 'encod'],
  function(stuff, encod){
    var sockavail = null;
    var host = '192.168.0.2';
    var port = 2628;
    var text = '';
    var resp = '';
    var db = "!";
    var callback = function(){};
   // var evo = document.createElement("br");
   // var got_def_ev = new Event('got_def');
    function chromeconnect(id){  chrome.socket.connect(id, host, port, function(){
            window.setTimeout(function(){chromewrite(id, text);}, 256);
        }); 
    }
    function chromewrite(id, text){
        var data = encod.str2utf8b(text);
        //console.log(encod.utf8b2str(encod.str2utf8b("ползущий like окна")));
        chrome.socket.write(id, data, function(){window.setTimeout(function(writeInfo){chromeread(id);}, 256);});
    }
    function chromeread(id){  chrome.socket.read(id, 65536, function(readInfo){
            resp = encod.utf8b2str(readInfo.data);
            //console.log("Got from gsocket "+resp);
            callback(resp);
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
                    callback(resp);
                    console.log("rettext == "+rettext);
                }else {
                    //alert(rettext.substring(0,32)); 
                    //moz_socket.resume();
                }
            }, 256)};
    }
    return {
        get_def:function(word, _clbck){
            callback = _clbck;
            text = "DEFINE "+db+" "+word+"\n";
            console.log(text);
            if(sockavail === 'chrome') chromecreate();
            else if (sockavail === 'mozilla') mozopen();
            else console.log("Socket still unavailiable or check first");
        },
        get_dbs:function(_clbck){
            callback = _clbck;
            text = "SHOW DATABASES\n";
            if(sockavail === 'chrome') chromecreate();
            else if (sockavail === 'mozilla') mozopen();
            else console.log("Socket still unavailiable or check first");
        },
        check:function(){
            if(navigator.mozTCPSocket) sockavail = 'mozilla';
            else if(chrome.socket) sockavail = 'chrome';
            else sockavail = null;
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
