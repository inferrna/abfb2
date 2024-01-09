define(
  ['stuff', 'encod', 'log', 'cordova.js'],
  function(stuff, encod, log){
    var sockavail = null;
    var host = 'localhost';
    var port = 2628;
    var text = '';
    var word = '';
    var resp = '';
    var db = "!";
    var rcl = 0;
    var exec = null;
    var callback = function(){};
    function tcpecho(arr, callback){};
    try {
        exec = cordova.require('cordova/exec');
        tcpecho = function(arr, callback) {
            exec(callback, function(err) {
                console.warn("Error calling cordova socket: "+err)
                callback("");
            }, "Echo", "echo", arr);
        };
        sockavail = 'cordova';
    } catch(e) { console.warn("No cordova sockets available."); }
    // Function to find index by matching the string against the regular expression
    function findIndexByRegex(array, regex) {
        for (var i = 0; i < array.length; i++) {
            if (regex.test(array[i])) {
                return i; // Return the index if a match is found
            }
        }
        return -1; // Return -1 if no match is found
    }


    function stringToCharCodes(str){
        var res = [];
        for (var i = 0; i < str.length; i++) {
            res.push(str.charCodeAt(i));
        }
        log.warn("stringToCharCodes got len "+res.length);
        return res;
    }
    function decodeCharCodesToUTF8(charCodes) {
    // Convert an array of character codes to a string
        var utf8String = '';

        for (var i = 0; i < charCodes.length; i++) {
            // Check if it's a valid UTF-8 code point
            if (charCodes[i] >= 0 && charCodes[i] <= 0x7F) {
                // Single-byte character
                utf8String += String.fromCharCode(charCodes[i]);
            } else if (charCodes[i] >= 0xC0 && charCodes[i] <= 0xDF && i + 1 < charCodes.length) {
                // Two-byte character
                utf8String += String.fromCharCode(((charCodes[i] & 0x1F) << 6) | (charCodes[i + 1] & 0x3F));
                i++; // Move to the next character code
            } else if (charCodes[i] >= 0xE0 && charCodes[i] <= 0xEF && i + 2 < charCodes.length) {
                // Three-byte character
                utf8String += String.fromCharCode(((charCodes[i] & 0xF) << 12) | ((charCodes[i + 1] & 0x3F) << 6) | (charCodes[i + 2] & 0x3F));
                i += 2; // Move to the next character code
            } else {
                // Invalid UTF-8 code point
                throw new Error('Invalid UTF-8 encoding');
            }
        }

        return utf8String;
    }

    function parse_resp(resp){
        "use strict";
        //log.warn("Raw response is:\n"+base64resp);
        //const resp = decodeURIComponent(window.atob(base64resp));
        //const resp = window.atob(base64resp);
        
        
        //Debug code!!
        //log.info(decodeCharCodesToUTF8(stringToCharCodes(resp)));
/*
        for (var i = 0; i < resp.length; i++) {
            try {
                log.info(resp.charAt(i));
            } catch(e) {
                log.warn("Failed to decode char at "+i+" with code "+resp.charCodeAt(i));
            }
        }
*/
        if(resp.match(/.*\n552 .{1,32}\n.*/)){
            if(rcl===0){rcl=1; get_matches();}
            else{rcl=0; callback("<b>"+word+"</b> not found.");}
        } else {
            var arr = resp.split("\n").filter(function(el){return el!='';});
            var start = findIndexByRegex(arr, /1\d\d .{2,32}/); //First line
            if(start==-1) {
                log.warn("Response was unsuccessful, code 1xx not found");
                return;
            }
            var end = findIndexByRegex(arr, /250 .{2,8}/); //Last line
            if(end==-1) {
                log.warn("Response was unsuccessful, code 250 not found in array");
                return;
            }
            var newresp = arr.slice(start+1, end-1).join("\n");
            log.warn("Response was successful, proceed further with length "+newresp.length);
            callback(newresp);
        }
    }
    function cordova_get(host, port, text){
        log.warn("cordova socket send '"+text+"'");
        tcpecho([host, port, text], function(resstr) {
            parse_resp(resstr);
        });
    }
    function chromeconnect(id){  chrome.socket.connect(id, host, port, function(){
            window.setTimeout(function(){chromewrite(id, text);}, 128);
        }); 
    }
    function chromewrite(id, text){
        var data = encod.str2utf8b(text);
        chrome.socket.write(id, data, function(){window.setTimeout(function(writeInfo){chromeread(id);}, 384);});
    }
    function chromeread(id){  chrome.socket.read(id, 65536, function(readInfo){
            resp = encod.utf8b2str(readInfo.data);
            chrome.socket.disconnect(id);
            chrome.socket.destroy(id);
            parse_resp(resp);
    }); }
    function chromecreate(){
        chrome.socket.create('tcp', null, function(createInfo){
                gsocketid = createInfo.socketId;
                chromeconnect(gsocketid);
            });
    }
    function mozopen(){
        "use strict";
        resp = '';
        var mtext = text;
        var data = encod.str2utf8b(mtext);
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
    function get_matches(){
        "use strict";
        var l = word.length;
        var cut = Math.floor(l/5);
        text = "MATCH "+db+" re ^.{0,"+cut+"}"+word.slice(cut, l-cut)+".{0,"+cut+"}$\n";
        if(sockavail === 'chrome') chromecreate();
        else if (sockavail === 'mozilla') mozopen();
        else if (sockavail === 'cordova') cordova_get(host, port, text);
        else console.warn("Socket still unavailiable or check first");
    }
    return {
        get_def:function(_word, _clbck){
            callback = _clbck;
            word = _word;
            text = "DEFINE "+db+" "+word;
            if(sockavail === 'chrome') chromecreate();
            else if (sockavail === 'mozilla') mozopen();
            else if (sockavail === 'cordova') cordova_get(host, port, text);
            else console.warn("Socket still unavailiable or check first");
        },
        get_dbs:function(_clbck){
            callback = _clbck;
            text = "SHOW DATABASES";
            if(sockavail === 'chrome') chromecreate();
            else if (sockavail === 'mozilla') mozopen();
            else if (sockavail === 'cordova') cordova_get(host, port, text);
            else console.warn("Socket still unavailiable or check first");
        },
        check:function(){
            var _chrome = false;
            try{if(chrome.socket) _chrome = true;}
            catch(e){console.warn("chrome socket unavailable"); }
            if(navigator.mozTCPSocket){
                try{
                    navigator.mozTCPSocket.open('8.8.8.8', 53, {binaryType: 'arraybuffer'});
                    sockavail = 'mozilla';
                } catch(e) {console.warn("navigator.mozTCPSocket present, but unaccessible");}
            }
            else if(_chrome) sockavail = 'chrome';
            return sockavail;
        },
        tcpsend:function(host, port, text){
            if(sockavail===null){
                return;
            }
            tcpsend([host, port, text]);
        },
        init:function(_host, _port, _db){
            if(sockavail===null){
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
