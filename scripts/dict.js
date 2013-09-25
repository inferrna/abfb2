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
    var dreq = new XMLHttpRequest();
    /*dreq.open("GET", "http://translate.google.com", true);
    try {dreq.send();}
    catch(e){console.log("XMLHttpRequest failed, got:",e);};*/
    dreq.onload = function (event) {
            console.log("XMLHttpRequest done");
            resp = '';
            var resptext = event.target.responseText;
            //console.log(JSON.parse(resptext)["dict"]);
            if(datas["dictionary"]==="google"){
                var respj = JSON.parse(resptext);
                if( Object.keys(respj).indexOf("sentences")>-1 ) resp += respj["sentences"][0]["trans"];
                if( Object.keys(respj).indexOf("dict">-1) )      resp += "<br>"+respj["dict"][0]["terms"].join(", ");
            }
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
            lword = word.toLowerCase();
            console.log("lword==",lword, "dict==", datas["dictionary"]);
            if(datas["dictionary"] == 'local') get_http(lword, locals, datas["local_base_url"], 'local');
            else if (datas["dictionary"] == 'google') get_http(lword, googles, datas["google_base_url"], 'google');
            else if (datas["dictionary"] == 'socket'){
                socket.check();
                socket.init(datas["host"], 2628);
                socket.evo.addEventListener('got_def', function (e) { resp = socket.response(); dreq.dispatchEvent(got_def_ev); }, false);
                socket.get_def(lword);
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
