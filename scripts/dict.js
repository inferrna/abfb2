define(
  ['stuff'],
  function(stuff){
    var resp = '';
    var got_def_ev = new Event('got_def');
    var gsocketid = 0;
    var datas = {
        google_base_url: 'http://translate.google.com/translate_a/t?client=Firefox&',
        local_base_url: "http://192.168.0.2:8082/?",//?text=+"value"+"&dict="+"!"+"&host="+"localhost"+"&port="+"2628";
        sl: 'en',
        tl: 'ru',
        hl: 'ru',
        ie: 'UTF-8',
        oe: 'UTF-8',
        text: '',
        multires: 1,
        otf: 2,
        trs: 1,
        ssel: 0,
        tsel: 0,
        sc: 1,
        text: 'true',
        dict: "!", //Dictionary for dictd. "!" means all availiable
        host: "localhost", //Host where is dictd on.
        port: 2628, //Port where is dictd on.
    };
    var googles = {text:'',sl:'',tl:'',hl:'',ie:'',oe:'',multires:0,otf:0,trs:0,ssel:0,tsel:0,sc:0};
    var locals  = {text:'',dict:'',host:'',port:0};
    //var locals_get_str = '';
    dreq = new XMLHttpRequest();
    //****alien, see https://github.com/GoogleChrome/chrome-app-samples/blob/master/serial/adkjs/app/js/serial.js ****
    function ab2str(buf) { //http://stackoverflow.com/a/16608615
        var bufView=new Uint8Array(buf);
        for (var i=0, l=bufView.length, s='', c; c = bufView[i++];)
        s += String.fromCharCode(
            c > 0xdf && c < 0xf0 && i < l-1
                ? (c & 0xf) << 12 | (bufView[i++] & 0x3f) << 6 | bufView[i++] & 0x3f
            : c > 0x7f && i < l
                ? (c & 0x1f) << 6 | bufView[i++] & 0x3f
            : c
        );
        return s;
    }
    function str2ab(string) {
        var buffer = new ArrayBuffer(string.length);
        var bufView = new Uint8Array(buffer);
        for(var i = 0; i < string.length; i++) {
          bufView[i] = string.charCodeAt(i);
        }
        console.log("str2ab buffer is", bufView);
        return buffer;
    }
    //***********end of alien**********************
    dreq.onload = function (event) {
            resp = event.target.responseText;
            //console.log("Got inner response ", resp);
            dreq.dispatchEvent(got_def_ev);
        }
    function chromeconnect(id, host, port){  chrome.socket.connect(id, host, port, function(){
            window.setTimeout(function(){chromewrite(id, "DEFINE ! "+datas.text+"\n");}, 256);
        }); 
    }
    function chromewrite(id, text){
        var data = str2ab(text);
        console.log(ab2str(str2ab("bЭc ж")));
        chrome.socket.write(id, data, function(writeInfo){chromeread(id);});
    }
    function chromeread(id){  chrome.socket.read(id, 1024, function(readInfo){console.log(ab2str(readInfo.data));}); }
    try {var socket = navigator.mozTCPSocket.open('localhost', 2628);}
    catch(e) {console.log("mozTCPSocket.open failed. GotError:", e);}
    chrome.socket.create('tcp', null, function(createInfo){
            gsocketid = createInfo.socketId;
            console.log("gsocketid==", gsocketid, "createInfo==", createInfo);
            chromeconnect(gsocketid, '192.168.0.2', 2628);
        });
    return {
        dreq:dreq, response:function(){return resp;}, 
        get_def:function(word){
            var l_arr = [];
            var params_get_str = '';
            params = locals;
            var param_base_url = datas.local_base_url;
            params['text'] = word;
            for (var key in params){
                l_arr.push(key+"="+params[key]);
            }
            params_get_str = l_arr.join("&");
            var url = param_base_url+params_get_str;
            dreq.open("GET", url, "true");
            dreq.send();
        },
        init_params:function(params){
            for (var key in params) datas[key] = params[key];
            for (var key in googles) googles[key] = datas[key];
            for (var key in locals){
                locals[key] = datas[key];
                //l_arr.push(key+"="+datas[key]);
            }
            //locals_get_str = l_arr.join("&");
        }
    };
  }
);
