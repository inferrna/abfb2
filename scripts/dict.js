define(
  ['stuff'],
  function(stuff){
    var resp = '';
    var got_def_ev = new Event('got_def');
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
    dreq.onload = function (event) {
            resp = event.target.responseText;
            //console.log("Got inner response ", resp);
            dreq.dispatchEvent(got_def_ev);
        }
    try {var socket = navigator.mozTCPSocket.open('localhost', '2628');}
    catch(e) {console.log("GotError:", e);}
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
