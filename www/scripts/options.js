define(
  ['dict', 'uitouch', 'socket', 'sdstorage', 'sharedc', 'sharedf'],
  function(dict, uitouch, socket, sdstorage, sharedc, sharedf){
    "use strict";
    var opts_brd   = document.getElementById('options');
    var opts_brd_b = document.getElementById('options_block');
    var lbl = document.createElement("label");
    var rng = document.createElement("input");
    var rngbr = document.createElement("br");
    var fnmre = /(.*)?\/(.+)/;
    lbl.style.order = "99";
    opts_brd.textContent = '';
    var toc = document.createElement("div");
    var dtoc = document.createElement("div");
    disable_prop(dtoc);
    toc.id = "toc";
    toc.style.width = "95%";
    dtoc.appendChild(toc);
    opts_brd_b.appendChild(dtoc);
    opts_brd_b.appendChild(lbl);
    rng.type="range"; rng.max=100; rng.min=0; rng.value=0; rng.style.height="5px"; rng.style.width="98%"; rng.style.borderRadius="48px";
    rng.style.backgroundColor="#010203"; rng.style.margin="1px"; rng.style.border="1px";
    rng.onchange = function(evt){sharedc.exec('options', 'ch_range')(evt.target.value)};
    rng.oninput = function(evt){lbl.textContent = 'Go to '+evt.target.value+'%';};
    lbl.textContent = "No books open";
    opts_brd_b.appendChild(lbl);
    opts_brd_b.appendChild(rngbr);
    opts_brd_b.appendChild(rng);
    var storage = null; 
    try { storage = localStorage } catch(e) {console.warn("localStorage not available");}
    var crstorage = null;
    try{ crstorage = chrome.storage.sync;} catch(e) {console.warn("chrome.storage not available");}
    var type;
    var file = {'name':'empty'};
    var filename = '';
    var currentpp = {'page':0, 'percent':0};
    var datas = {
        dict_src: [['google', 'socket', 'google proxy', 'socket proxy'], "Select dictionary source", 'list-item'],
        dict_db: [['!'], "Dict db (! means all)", 'none'],
        lang_f: ['en', "Translate from", 'none'],
        lang_t: ['ru', "Translate to", 'none'],
        socket_host: ['localhost', "dictd host", 'none'],
        socket_port: ['2628', "dictd port", 'none'],
        proxy_host: ['localhost', "proxy host", 'none'],
        proxy_port: ['8082', "proxy port", 'none'],
        dsfile: [[], "Or choose it from list", 'list-item'],
        file: ['',  'Select a book', 'list-item']
    };
    var showdeps = {
        'google':/lang_f|lang_t/,
        'google proxy':/proxy_host|proxy_port|lang_f|lang_t/,
        'socket proxy':/socket_host|socket_port|proxy_host|proxy_port|dict_db/,
        'socket':/socket_host|socket_port|dict_db/,
        'excepts':/dsfile|file|dict_src/
    };
    function draw_deps(el){
        if(el.id!='dict_src') return;
        var ex = showdeps['excepts'];
        var shows = showdeps[el.value];
        if(el.value==='socket proxy' || el.value==='socket') {dict.get_dbs(el.value);}
        if(!shows && !ex) return;
        for(var key in datas){
            if(!ex.test(key) && !shows.test(key)) document.getElementById(key).parentNode.style.display = 'none';
            else if (shows.test(key)) document.getElementById(key).parentNode.style.display = 'list-item';
        }
    }
    var hasStorage = (function() {
      try {
        localStorage.setItem('try', 'try');
        localStorage.removeItem('try');
        return true;
        storage = localStorage;
      } catch(e) {
        return false;
      }
      return false;
    }());
    var values = {};
    function check_params(callbacks){
        callbacks[0](callbacks);
    }
    function hasgoogle(callbacks){
        callbacks.splice(0,1);
        var oReq = new XMLHttpRequest({mozSystem: true});
        oReq.addEventListener("error", function(){datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('google'),1);
                                                            callbacks[0](callbacks);}, false);
        oReq.addEventListener("abort", function(){datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('google'),1);
                                                            callbacks[0](callbacks);}, false);
        oReq.addEventListener("load", function(){
                  datas.dict_src[0].splice(datas['dict_src'][0].indexOf('google proxy'),1);
                  callbacks[0](callbacks);
            }, false);
        try {oReq.open("GET", "http://translate.google.com/?", true); oReq.send();}
        catch(e) { datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('google'),1); callbacks[0](callbacks); }
    }
    function hassocket(callbacks){
        callbacks.splice(0,1);
        if(socket.check()===null){
            datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('socket'),1);
        } else {
            datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('socket proxy'),1);
        }
        callbacks[0](callbacks);
    }
    function disable_prop(_el){
        _el.addEventListener("touchstart", function(e){e.stopPropagation();}, true);
        _el.addEventListener("touchend", function(e){e.stopPropagation();}, true);
        _el.addEventListener("touchmove", function(e){e.stopPropagation();}, true);
    }
    function create_select(obj, name, elements, key, disp){
        var sel = document.createElement("select");
        var nm  = document.createElement("option");
        var br  = document.createElement("br");
        var sp  = document.createElement("span");
        nm.textContent = name;
        nm.selected = 1;
        nm.disabled = 1;
        sel.appendChild(nm);
        sel.id = key;
        sel.style.width = "80%";
        if(key==="dict_db"){
            sharedc.register('dict', 'got_dbs', function(_txt){add_dbs(sel, nm, _txt);});
        }else if(key==="dsfile"){
                sel.addEventListener("change", 
                            function (evt){
                                var fnm = evt.target.options[evt.target.selectedIndex].value;
                                var _filename = fnm.replace(sharedf.relf, "$2");
                                if(_filename != filename){
                                    filename = _filename;
                                    sdstorage.get(fnm, function (_file) {
                                                                   file = _file;
                                                                   set_opt('last_file', filename);
                                                                   set_opt(filename+"_time", Date.now());
                                                                   sharedc.exec('options', 'got_file')();});
                                }
                            }, false);
                sdstorage.parse(sel, obj);
            return sel;
        } 
        sel.addEventListener("change", function(evt){
                                    if(evt.target.disabled === true) {
                                        evt.target.disabled = false;
                                    } else {
                                        get_config(); draw_deps(evt.target);
                                        var value = evt.target.options[evt.target.selectedIndex].value;
                                        set_opt("sel_"+sel.id, value); 
                                        values[evt.target.id] = value;
                                        dict.init_params({"db": values["dict_db"], "dictionary": values["dict_src"]});
                                    }
                                    }, false);
        for(var eln in elements){
            var el = document.createElement("option");
            el.textContent = elements[eln];
            el.value = elements[eln];
            sel.appendChild(el);
        }
        disable_prop(sel);
        sp.appendChild(sel);
        sp.style.display=disp;
        obj.appendChild(sp);
        return sel;
    }
    function create_input(obj, name, value, key, disp){
        var sel = document.createElement("label");
        var inp = document.createElement("input");
        var br  = document.createElement("br");
        var sp  = document.createElement("span");
        sp.style.width = "100%";
        sel.textContent = name;
        inp.id = key;
        inp.style.left="4px";
        if(key==="file") {   inp.type = 'file'; //inp.accept="application/epub+zip,text/xml,text/plain";
                             inp.addEventListener("change", function (evt){
                                                            var input = evt.target;
                                                            file = evt.target.files[0];
                                                            filename = file.name.replace(fnmre, "$2");
                                                            set_opt('last_file', filename);
                                                            set_opt(filename+"_time", Date.now());
                                                            sharedc.exec('options', 'got_file')();}, false );
        } else {
            inp.value = value;
            var params = [];
            params.push(inp.id);
            inp.type = 'text';
            inp.addEventListener("change",
                function(evt){get_config(); var input = evt.target; set_opt(input.id, input.value); 
                              dict.init_params({"dictionary": values["dict_src"], "host": values["socket_host"],
                                               "port": parseInt(values["socket_port"]),
                                               "sl": values["lang_f"], "hl": values["lang_t"], "tl": values["lang_t"],
                                               "phost": values['proxy_host'], "pport": values['proxy_port']});
                              dict.get_dbs(values["dict_src"]);}, false);
            get_opt(params, function(key, value){
                    if(value){ 
                        inp.value = value;
                        try { var evt = new Event('change');}
                        catch (e) { var evt = document.createEvent('Event'); evt.initEvent('change', true, true); }
                        inp.dispatchEvent(evt);
                    }
                },null);
        }
        sp.appendChild(sel);
        disable_prop(inp);
        sp.appendChild(inp);
        sp.style.display=disp;
        obj.appendChild(sp);
    }
    function display(mode){
        if(mode==='show')
            if(opts_brd_b.style.display==='none') opts_brd_b.style.display='block';
            else{opts_brd.parentNode.style.display='block';}
        if(mode==='hide')
            if(opts_brd.parentNode.style.display!='none') opts_brd.parentNode.style.display='none';
            else opts_brd_b.style.display='none';
    }
    function get_config(){
        values = {};
        for(var key in datas){
            var elem = document.getElementById(key);
            if(elem){ values[key] = elem.value; }
            else{console.warn("No "+key+" found.");}
        }
        dict.init_params({"db": values["dict_db"], "dictionary": values["dict_src"], 
                          "host": values["socket_host"], "port": parseInt(values["socket_port"]), 
                          "sl": values["lang_f"], "hl": values["lang_t"], "tl": values["lang_t"],
                          "phost": values['proxy_host'], "pport": values['proxy_port']  });
        return values;
    }
    function set_sel_vl(sel){
        get_opt(["sel_"+sel.id], function(ky, vl){
                var opts = Array.prototype.slice.call(sel.options);
                var id = opts.map(function(el){return (el.value===vl);}).indexOf(true);
                if(id!=-1) { sel.selectedIndex = id;
                             draw_deps(sel); 
                             get_config(); }
            });
    }
    function makepos(x){
        x = x||0;
        var re = /.+?\..+?/, result = x;
        if(re.test(x)) result = parseFloat(x);
        else result = parseInt(x);
        if(isNaN(x) && x<0) result = 0;
        return result;
    }
    function get_cr(keys, callback, evt){
        crstorage.get(keys, function(result){
                for(var key in result){
                    callback( key, result[key] );
                }
                if(evt) sharedc.exec('options', evt)();
            });
    }
    function get_ls(keys, callback, evt){
        for(var key in keys){
            callback( keys[key], storage.getItem(keys[key]) );
        }
        if(evt) sharedc.exec('options', evt)();
    }
    function get_opt(keys, callback, evt){
        if(hasStorage) get_ls(keys, callback, evt);
        else if(crstorage) get_cr(keys, callback, evt);
        else if(evt) sharedc.exec('options', evt)();
    }
    function set_opt(key, p){
        if(hasStorage) set_ls(key, p);
        else if(crstorage) set_cr(key, p);
    }
    function set_cr(key, p){
        var pair = {};
        pair[key] = p;
        crstorage.set(pair, function(){/*console.log(p+" saved as "+key);*/});
    }
    function set_ls(key, p){
        localStorage.setItem(key, p);
    }
    function fill_params(callbacks){
        var sels = [];
        for(var key in datas){
            type = typeof(datas[key][0]);
            if(type=="object") sels.push(create_select(opts_brd, datas[key][1], datas[key][0], key, datas[key][2]));
            if(type=="string") create_input(opts_brd, datas[key][1], datas[key][0], key, datas[key][2]);
        }
        get_config();
        sels.map(function(sl){set_sel_vl(sl);});
    }
    function add_dbs(sel, _nm, txt){
        var _txt = txt.replace(/\ /g, "_._").replace(/(\s|\0)+/g, "\n")
                      .replace(/_\._/g, " ").replace(/\"/g, "");
        var count = parseInt(txt.replace(/\s+/g, " ")
                                .replace(/(.*110.+?)(\d*)(.+?databases present.*)/, "$2"));
        var arr = _txt.split("\n").filter(function(el){return el!='';});
        var start = arr.indexOf("250 ok")-2;
        if(isNaN(count) || start<0) { console.warn("No db count or start in "+txt); return; }
        var itms = [];
        Array.prototype.slice.call(sel.options).map(function(el){sel.removeChild(el);});
        sel.appendChild(_nm);
        for(var i = start; i>(start-count) && i>0; i--){
                var itms = arr[i].split(" ");
                var nm  = document.createElement("option");
                nm.value = itms[0];
                nm.textContent = arr[i].replace(itms[0]+" ", '');
                sel.appendChild(nm);
        }
        sel.addEventListener("change", function(evt){
                            var p = {};
                            p['dict'] = evt.target.options[evt.target.selectedIndex].value;
                            dict.init_params(p);}, true);
        set_sel_vl(sel);
    }
    function remove_key(key){
        if(storage){
            storage.removeItem(key);
        } else if(crstorage) {
            var keys = [];
            keys.push(key);
            crstorage.remove(keys, function(){
                }) 
        }
    }

    function remove_old(items){
        var keys = Object.keys(items);
        var timekeys = keys.filter(function(str){return str.match(/.+?_time/);});
        var time = Date.now()-2592000000;//Month for all
        var badtimekeys = timekeys.filter(function(key){return items[key] < time});
        var badprefixes = badtimekeys.map(function(item, i, arr){return item.replace(/(.+?)_time/, "$1");});
        if(badprefixes.length==0) return; 
        var re = new RegExp("("+badprefixes.join("|")+")_(.+)");
        var badkeys = keys.filter(function(str){return str.match(re);});
        time = Date.now()-259200000;     //3 days for a single page
        badtimekeys = timekeys.filter(function(key){return items[key] < time});
        badprefixes = badtimekeys.map(function(item, i, arr){return item.replace(/(.+?)_time/, "$1");});
        if(badprefixes.length==0) return; 
        re = new RegExp("("+badprefixes.join("|")+")_last_html");
        badkeys = badkeys.concat(keys.filter(function(str){return str.match(re);}));
        re = new RegExp(filename+"_(.+?)");
        badkeys = badkeys.filter(function(str){return !str.match(re);});
        badkeys.map(function(item, i, arr){remove_key(item);});
    }

    function get_all_itms(callback){
        if(storage) {
            var items = {}; var i = 0; var key = null;
            for (;key = storage.key(i); i++) items[key] = storage.getItem(key);
            callback(items);
            return;
        }
        if(crstorage) crstorage.get(null, function(items) {
                callback(items);
        });
    } 
    function savepp(){
        var prckey = filename+"_prc", pnmkey = filename+"_pnm", timekey = filename+"_time";
        set_opt(prckey, currentpp['percent']);
        set_opt(pnmkey, currentpp['page']);
        set_opt(timekey, Date.now());
    }
    function getpp(){
        currentpp = {'page':0, 'percent':0};
        var prckey = filename+"_prc", pnmkey = filename+"_pnm";
        var ps = {};
        ps[prckey] = 'percent';
        ps[pnmkey] = 'page';
        get_opt(Object.keys(ps), function(key, val){
                currentpp[ps[key]] = makepos(val);
            }, 'got_pp');
    }

    check_params([hasgoogle, hassocket, fill_params]);
    return{
            display:function(mode){
                display(mode);
            },
            config:function(){
                return values;
            },
            bookfile:function(){
                return file;
            },
            remove_opt:function(key){
                remove_key(key);
            },
            set_opt:function(key, val, file){
                var param;
                if(file) param = filename+"_"+key;
                else param = key;
                set_opt(param, val);
            },
            remove_old:function(){
                get_all_itms(remove_old);
            },
            get_opt:function(key, callback, file){
                var ps = [];
                if(file) ps.push(filename+"_"+key);
                else ps.push(key);
                get_opt(ps, function(ky, vl){callback(vl);}, null);
            },
            savepp:function(){
                savepp();
            },
            getpp:function(){
                getpp();
            },
            setpercent:function(percent){
                if(isNaN(percent)) currentpp['percent'] = 0;
                else currentpp['percent'] = percent;
                rng.value = Math.round(currentpp['percent']);
                lbl.textContent = parseInt(percent)+"% of current chapter";
            },
            msg:function(text){
                if(text) { lbl.textContent = text; return null;}
                else return lbl.textContent;
            },
            getpercent:function(){
                return currentpp['percent'];
            },
            setpage:function(page){
                if(isNaN(page)) currentpp['page'] = 0;
                else currentpp['page'] = page;
            },
            getpage:function(){
                return currentpp['page'];
            },
            filename:function(){
                return filename;
            }
    };
  }
);
