define(
  ['stuff', 'encod', 'socket'],
  function(stuff, encod, socket){
    var resp = '';
    var callbacks = {'got_def':function(){}, 'got_dbs':function(){}}; 
    //var got_def_ev = new Event('got_def');
    var gsocketid = 0;
    var cache = {};
    var lword = '';
    var datas = {
        google_base_url:  'http://translate.google.com/translate_a/t?client=Firefox&',
        google_proxy_url: '/t?client=Firefox&',
        local_base_url: "http://192.168.0.2:8082/?",//?text=+"value"+"&dict="+"!"+"&host="+"localhost"+"&port="+"2628";
        dictionary: '',
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
        host: "192.168.0.2", //Host where is dictd on.
        port: 2628, //Port where is dictd on.
        phost: '',
        pport: '',
        db: '!' //Dictionary db
    };
    var googles = {text:'',sl:'',tl:'',hl:'',ie:'',oe:'',multires:0,otf:0,trs:0,ssel:0,tsel:0,sc:0};
    var locals  = {text:'',host:'',port:0};
    var seealso = [];
    function get_http(_text, params, baseurl, callback, basetxt){
        var dreq = new XMLHttpRequest({mozSystem: true});
        dreq.onload = function (event) {
                resp = basetxt;
                var resptext = event.target.responseText;
                if(datas["dictionary"].match("google.*?$")){
                    resp +="<b>"+_text+"</b> -> "; 
                    var respj = JSON.parse(resptext);
                    if( Object.keys(respj).indexOf("sentences")>-1 ) resp += respj["sentences"][0]["trans"];
                    if( Object.keys(respj).indexOf("dict">-1) )      try{ resp += "<br>"+respj["dict"][0]["terms"].join(", ");}
                    catch(e) {console.warn(e.stack);}
                    if(seealso.length>0){
                        resp+="<br><b>Also look at:</b>";
                        callback(resp, seealso);
                    } else callback(resp);
                } else {
                    resp += resptext;
                    callback(resp);
                }
            }
        var l_arr = [];
        var params_get_str = '';
        params['text'] = _text;
        for (var key in params){
            l_arr.push(key+"="+params[key]);
        }
        params_get_str = l_arr.join("&");
        var url = baseurl+params_get_str;
        dreq.open("GET", url, "true");
        dreq.send();
    }
    function get_def(word){
            lword = word.replace(/(^\s)|(\s$)/gm, "").replace(/(^)(\W*)(.*?)(\W*?)($)/, "$3$5");//.toLowerCase().replace(/(^\s)|[\.\!\?\,\;\:]|(\s$)/gm, "");
            if(cache[lword]) { console.log("Got from cache"); callbacks['got_def'](cache[lword], seealso);}
            else if(datas["dictionary"] === 'socket proxy') get_http('DEFINE '+datas["db"]+' '+lword+'\n', locals, "http://"+datas["phost"]+":"+datas["pport"]+"/?", callbacks['got_def'], '');
            else if (datas["dictionary"] === 'google') get_http(lword, googles, datas["google_base_url"], callbacks['got_def'], '');
            else if (datas["dictionary"] === 'google proxy') get_http(lword, googles,
                                   "http://"+datas["phost"]+":"+datas["pport"]+datas["google_proxy_url"], callbacks['got_def'], '');
            else if (datas["dictionary"] === 'socket'){
                socket.check();
                socket.init(datas["host"], 2628, datas["db"]);
                socket.get_def(lword, callbacks['got_def']);
            } else console.log("No dictionary selected");

    }

    return {
        response:function(){
            if (datas["dictionary"] == 'socket') resp = socket.response();
            return resp;
        },
        push_cache:function(def){
            cache[lword] = def;
            var keys = Object.keys(cache);
            if(keys.length>64) delete cache[keys[0]];
        },
        get_def:function(texts){
            var word = texts[0];
            if(texts[1] && texts.length>0) seealso = texts[1].map(function(itm){
                    var a = document.createElement("span");
                    a.textContent = itm;
                    a.onclick = function(evt){get_def(evt.target.textContent);};
                    //a.addEventListener("click", function(evt){get_def(evt.target.textContent);}, false);
                    return a;
                });
            else seealso=[];
            get_def(word);
        },
        get_dbs:function(type){
            if(type === 'socket proxy') get_http("SHOW DATABASES\n", locals, "http://"+datas["phost"]+":"+datas["pport"]+"/?", callbacks['got_dbs']);
            else {
                socket.check();
                socket.init(datas["host"], 2628, datas["db"]);
                socket.get_dbs(callbacks['got_dbs']);
            }
        },
        lang:function(){return datas["sl"]},
        lword:function(){return lword},
        init_params:function(params){
            for (var key in params) datas[key] = (params[key] != null ? params[key] : datas[key]);
            for (var key in googles) googles[key] = datas[key];
            for (var key in locals){
                locals[key] = datas[key];
                //l_arr.push(key+"="+datas[key]);
            }
            cache = {};
            //locals_get_str = l_arr.join("&");
        },
        add_callback:function(key, fcn){
            callbacks[key] = fcn;
        }
    };
  }
);
