define(
  ['stuff', 'encod', 'socket', 'sharedc'],
  function(stuff, encod, socket, sharedc){
    var resp = '';
    //var got_def_ev = new Event('got_def');
    var gsocketid = 0;
    var cache = {};
    //https://translate.google.ru/translate_a/single?client=t&sl=en&tl=ru&hl=ru&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&tk=519171|215131&q=cheap
    var datas = {
        google_base_url:  'http://translate.google.com/translate_a/single?client=t&',
        google_proxy_url: '/t?client=t&',
        local_base_url: "http://192.168.0.2:8082/?",//?text=+"value"+"&dict="+"!"+"&host="+"localhost"+"&port="+"2628";
        dictionary: '',
        sl: '',
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
    var googles = {text:'', q:'', sl:'',tl:'',hl:'',ie:'',oe:'', dt:'t', dt:'at', multires:0,otf:1,trs:0,ssel:0,tsel:0,sc:0};
    var locals  = {text:'',host:'',port:0};
    function get_http(_text, params, baseurl, callback, basetxt){
        var dreq = new XMLHttpRequest({mozSystem: true});
        dreq.onload = function (event) {
                resp = basetxt;
                var resptext = event.target.responseText;
                if(datas["dictionary"].match("google.*?$")){
                    resp +="<b>"+_text+"</b> -><br>";
                    console.log(resptext);//NFP
                    resp += resptext.match(/\".+?\"/g)
                                    .map(function(x){if(x!=='\"'+_text+'\"' && x!=='\"'+params['sl']+'\"')return x})
                                    .join(",")
                                    .replace(/,+/gi, ", ")
                    callback(resp);
                } else {
                    resp += resptext;
                    callback(resp);
                }
            }
        var l_arr = [];
        var params_get_str = '';
        params['text'] = _text;
        params['q'] = _text;
        for (var key in params){
            l_arr.push(key+"="+params[key]);
        }
        l_arr.push("dt=t");
        l_arr.push("dt=at");
        params_get_str = l_arr.join("&");
        var url = baseurl+params_get_str;
        console.log(url);//NFP
        dreq.open("GET", url, "true");
        dreq.send();
    }
    function push_cache(word, def){
        cache[word] = def;
        var keys = Object.keys(cache);
        if(keys.length>64) delete cache[keys[0]];
    }
    function get_def(word, seealso){
            var lword = word.replace(/(^\s*)|(\s*$)/gm, "");
            function got_def(resp){
                push_cache(lword, resp);
                sharedc.exec('dict', 'got_def')(resp, lword, seealso);
            }
            if(cache[lword]) { console.log("Got from cache"); sharedc.exec('dict', 'got_def')(cache[lword], lword, seealso);}
            else if(datas["dictionary"] === 'socket proxy'){
                get_http('DEFINE '+datas["db"]+' '+lword+'\n', locals, "http://"+datas["phost"]+":"+datas["pport"]+"/?", 
                    got_def, '');
            }
            else if (datas["dictionary"] === 'google') get_http(lword, googles, datas["google_base_url"], got_def, '');
            else if (datas["dictionary"] === 'google proxy') get_http(lword, googles,
                                   "http://"+datas["phost"]+":"+datas["pport"]+datas["google_proxy_url"], got_def, '');
            else if (datas["dictionary"] === 'socket'){
                console.log("word " + lword + " requested to socket");
                socket.check();
                socket.init(datas["host"], 2628, datas["db"]);
                socket.get_def(lword, function(resp){
                        console.log("word " + lword + " answered by socket with "+resp.length+" length answer");
                        try {
                            var rex = new RegExp("([.,\?! \s]|^)("+lword+")([.,\?! \s]|$)", "mgi");
                            var ren = new RegExp("[\n]+", "mgi");
                            resp = resp.replace("<tr>", "<i>")
                                       .replace(ren, "<br>")
                                       .replace("</tr>", "</i>")
                                       .replace(" ~ ", " <b>"+lword+"</b> ")
                                       .replace(" * ", " <b>"+lword+"</b> ")
                                       .replace(rex, "$1<b>$2</b>$3");
                        } catch(e) { console.log("error modifying response from socket: "+e) }
                    
                        got_def(resp);
                    });
            } else console.log("No dictionary selected");

    }

    return {
        response:function(){
            if (datas["dictionary"] == 'socket') resp = socket.response();
            return resp;
        },
        get_def:function(texts){
            var word = texts[0];
            if(texts[1] && texts.length>0) var seealso = texts[1].map(function(itm){
                    var a = document.createElement("span");
                    a.textContent = itm;
                    a.onclick = function(evt){get_def(evt.target.textContent, []);};
                    //a.addEventListener("click", function(evt){get_def(evt.target.textContent);}, false);
                    return a;
                });
            else var seealso=[];
            get_def(word, seealso);
        },
        get_dbs:function(type){
            if(type === 'socket proxy')
                get_http("SHOW DATABASES\n", locals, "http://"+datas["phost"]+":"+datas["pport"]+"/?", sharedc.exec('dict', 'got_dbs'));
            else {
                socket.check();
                socket.init(datas["host"], 2628, datas["db"]);
                socket.get_dbs(sharedc.exec('dict', 'got_dbs'));
            }
        },
        lang:function(){return datas["sl"]},
        init_params:function(params){
            var oldl = datas["sl"];
            for (var key in params) datas[key] = (params[key] != null ? params[key] : datas[key]);
            for (var key in googles) googles[key] = datas[key];
            for (var key in locals){
                locals[key] = datas[key];
            }
            cache = {};
            if(datas["sl"]!==oldl && sharedc.exec('dict', 'change_lng')) sharedc.exec('dict', 'change_lng')(datas["sl"]);
        }
    };
  }
);
