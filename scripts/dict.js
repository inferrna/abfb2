define(
  ['stuff', 'encod', 'socket'],
  function(stuff, encod, socket){
    var resp = '';
    var got_def_ev = new Event('got_def');
    var gsocketid = 0;
    var datas = {
        google_base_url: 'http://translate.google.com/translate_a/t?client=Firefox&',
        local_base_url: "http://192.168.0.2:8082/?",//?text=+"value"+"&dict="+"!"+"&host="+"localhost"+"&port="+"2628";
        dictionary: 'google',
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
            var resptext = event.target.responseText;
            console.log(JSON.parse(resptext)["dict"]);
            if(datas["dictionary"]==="google")resp = JSON.parse(resptext)["dict"][0]["terms"].join(", ");
            else resp = resptext;
            //alert("Got "+resp);
            //console.log("Got inner response ", resp);
            dreq.dispatchEvent(got_def_ev);
        }
    function get_http(word, params, baseurl, dictionary){
            var l_arr = [];
            var params_get_str = '';
            params['text'] = word;
            for (var key in params){
                l_arr.push(key+"="+params[key]);
            }
            params_get_str = l_arr.join("&");
            var url = baseurl+params_get_str;
            dreq.open("GET", url, "true");
            dreq.send();
            //alert("Request sended, url was "+url+".");
            console.log("Request sended, url was", url);
    }
    return {
        dreq:dreq, 
        response:function(){return resp;}, 
        get_def:function(word){
            if(datas["dictionary"] == 'local') get_http(word, locals, datas["local_base_url"], 'local');
            else if (datas["dictionary"] == 'google') get_http(word, googles, datas["google_base_url"], 'google');
            else if (datas["dictionary"] == 'socket'){
                socket.check();
                socket.init('192.168.0.2', 2628);
                socket.evo.addEventListener('got_def', function (e) { resp = socket.response(); dreq.dispatchEvent(got_def_ev); }, false);
                socket.get_def(word);
            }
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
