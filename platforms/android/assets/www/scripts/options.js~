define(
  ['dict', 'uitouch', 'socket'],
  function(dict, uitouch, socket){
    var callbacks = {'got_file':function(){}, 'got_pp':function(){}};
    var opts_brd   = document.getElementById('options');
    var opts_brd_b = document.getElementById('options_block');
    var lbl = document.createElement("label");
    var fnmre = /(.*)?\/(.+)/;
    lbl.style.order = "99";
    opts_brd.textContent = '';
    var toc = document.createElement("div");
    var dtoc = document.createElement("div");
    var pincher = document.getElementById('pincher').cloneNode(true);
    pincher.style.order = "100";
    disable_prop(dtoc);
    toc.id = "toc";
    dtoc.appendChild(toc);
    opts_brd_b.appendChild(dtoc);
    opts_brd_b.appendChild(lbl);
    opts_brd_b.appendChild(pincher);
    var storage = null;// || 
    try { storage = localStorage } catch(e) {console.warn("localStorage not available");}
    var crstorage = null;
    try{ crstorage = chrome.storage.sync;} catch(e) {console.warn("chrome.storage not available");}
    var type;
    var file = {'name':'empty'};
    var filename = '';
    var currentpp = {'page':0, 'percent':0};
    var datas = {
        dict_src: [['google', 'dictd proxy', 'socket'], "Select dictionary source", 'list-item'],
        dict_db: [['!'], "Dict db (! means all)", 'none'],
        lang_f: ['en', "Translate from", 'none'],
        lang_t: ['ru', "Translate to", 'none'],
        socket_host: ['192.168.0.2', "dictd host", 'none'],
        socket_port: ['2628', "dictd port", 'none'],
        proxy_host: ['192.168.0.2', "proxy host", 'none'],
        proxy_port: ['8082', "proxy port", 'none'],
        dsfile: [[], "Or choose it from list", 'list-item'],
        file: ['',  'Select a book', 'list-item']
    };
    var showdeps = {
        'google':/lang_f|lang_t/,
        'dictd proxy':/socket_host|socket_port|proxy_host|proxy_port|dict_db/,
        'socket':/socket_host|socket_port|dict_db/,
        'excepts':/dsfile|file|dict_src/
    };
    function draw_deps(el){
        if(el.id!='dict_src') return;
        console.log("selected "+el.value);
        var ex = showdeps['excepts'];
        var shows = showdeps[el.value];
        if(el.value==='dictd proxy' || el.value==='socket') dict.get_dbs(el.value);
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
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("error", function(){console.log("g error"); datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('google'),1);
                                                            callbacks[0](callbacks);}, false);
        oReq.addEventListener("abort", function(){console.log("g abrtd"); datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('google'),1);
                                                            callbacks[0](callbacks);}, false);
        oReq.addEventListener("load", function(){callbacks[0](callbacks);}, false);
        try { oReq.open("GET", "http://translate.google.com/?", true); oReq.send(); }
        catch(e) { datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('google'),1); callbacks[0](callbacks); }
    }
    function hassocket(callbacks){
        //var cs = 0, ms = 0;
        callbacks.splice(0,1);
        //try{ cs = chrome.socket } catch(e) { console.warn(e.stack);}
        //try{ ms = navigator.mozTCPSocket} catch(e) { console.warn(e.stack);}
        
        if(socket.check()===null){
            datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('socket'),1);
            //delete datas['socket_host'];
            //delete datas['socket_port'];
        }
        console.log("checked socket");
        callbacks[0](callbacks);
    }
    function disable_prop(_el){
        _el.addEventListener("touchstart", function(e){e.stopPropagation();}, true);
        _el.addEventListener("touchend", function(e){e.stopPropagation();}, true);
        _el.addEventListener("touchmove", function(e){e.stopPropagation();}, true);
    }
    //var winstyle = element.currentStyle || window.getComputedStyle(element, null);
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
        //<device storage
        if(key==="dict_db"){
            dict.add_callback('got_dbs', function(_txt){add_dbs(sel, nm, _txt);});
            //dict.get_dbs();
        }else if(key==="dsfile"){
            if (navigator.getDeviceStorage) {
                sel.addEventListener("change", 
                                function (event){
                                    var fnm = event.target.options[event.target.selectedIndex].value;
                                    console.log("Select file changed "+filename);
                                    var sdcard = navigator.getDeviceStorage('sdcard');
                                    var request = sdcard.get(fnm);
                                    filename = fnm.replace(fnmre, "$2");
                                    request.onsuccess = function () {  file = this.result;
                                                                       console.log("Got the file: "+filename); 
                                                                       set_opt('last_file', filename);
                                                                       set_opt(filename+"_time", Date.now());
                                                                       callbacks['got_file']();}
                                    request.onerror = function () { console.warn("Unable to get the file: " + this.error); }
                                }, false);
                try { parse_storage(sel, obj);}
                catch(e) {console.warn("Parse storage failed, got"+e.stack); delete sel; return;}
            } else { console.log("No navigator.getDeviceStorage api found"); delete datas[key];}
            return;
        }
        //device storage>
        for(var eln in elements){
            var el = document.createElement("option");
            el.textContent = elements[eln];
            el.value = elements[eln];
            sel.appendChild(el);
        }
        sel.addEventListener("change", function(evt){get_config(); draw_deps(evt.target); }, false);
        disable_prop(sel);
        sp.appendChild(sel);
        sp.style.display=disp;
        obj.appendChild(sp);
        //obj.appendChild(br);
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
                             //get_opt(params, function(key, value){console.log(key+"=got="+value); if(value) inp.value = value;},null);
                             inp.addEventListener("change", function (evt){
                                                            var input = evt.target;
                                                            file = evt.target.files[0];
                                                            filename = file.name.replace(fnmre, "$2");
                                                            set_opt('last_file', filename);
                                                            set_opt(filename+"_time", Date.now());
                                                            callbacks['got_file']();}, false );
        } else {
            inp.value = value;
            var params = [];
            params[0] = inp.id;
            get_opt(params, function(key, value){console.log(key+"=got="+value); if(value) inp.value = value;},null);
            inp.type = 'text';
            inp.addEventListener("change",
                function(evt){get_config(); var input = evt.target; set_opt(input.id, input.value); 
                              dict.init_params({"dictionary": values["dict_src"], "host": values["socket_host"], "port": parseInt(values["socket_port"]),
                                               "sl": values["lang_f"], "hl": values["lang_t"], "tl": values["lang_t"],
                                               "phost": values['proxy_host'], "pport": values['proxy_port']  });
                               dict.get_dbs(values["dict_src"]);}, false);
        }
        //obj.appendChild(br);
        sp.appendChild(sel);
        disable_prop(inp);
        sp.appendChild(inp);
        sp.style.display=disp;
        obj.appendChild(sp);
    }
    function display(mode){
        //console.log(mode, opts_brd_b.style.display, opts_brd.style.display);
        if(mode==='show')
            //opts_brd.parentNode.display='block';
            if(opts_brd_b.style.display==='none') opts_brd_b.style.display='block';
            else{opts_brd.parentNode.style.display='block';}
        if(mode==='hide')
            //opts_brd.parentNode.display='none';
            if(opts_brd.parentNode.style.display!='none') opts_brd.parentNode.style.display='none';
            else opts_brd_b.style.display='none';
    }
    function get_config(){
        values = {};
        for(var key in datas){
            //type = typeof(datas[key][0]);
            try{ values[key] = document.getElementById(key).value; }
            catch(e){console.warn(e.stack);}
        }
        //console.log("Got config: "+JSON.stringify(values));
        dict.init_params({"dictionary": values["dict_src"], "host": values["socket_host"], "port": parseInt(values["socket_port"]), 
                                                            "sl": values["lang_f"], "hl": values["lang_t"], "tl": values["lang_t"],
                                                            "phost": values['proxy_host'], "pport": values['proxy_port']  });
        return values;
    }
    function parse_storage(sel, obj){
        var pics = navigator.getDeviceStorage('sdcard');
        // Let's browse all the images available
        var cursor = pics.enumerate();
        var count = 0;
        var slf = this;
        var badtext = "No any book on your SD card. You may try pick it by button above, or put books on SD card and reopen app.";
        var filere = /.*fb2|.*epub|.*txt/i;
        window.setTimeout(function(){slf.return}, 2048);
        cursor.onsuccess = function () {
            function g_or_b(err){
                if(count>0) {
                    obj.appendChild(sel);
                    lbl.textContent = count+" files found on SD card";
                    get_opt(['last_file'], 
                        function(ky, vl){ for(var i = 0; i < sel.options.length; i++){
                                              if(sel.options[i].value.replace(fnmre, "$2") === vl){
                                                  sel.selectedIndex = i;
                                                  var evt = new Event('change');
                                                  sel.dispatchEvent(evt);
                                              }
                                          } }, null);
                } else {
                    delete sel;
                    lbl.textContent = badtext+" (err: "+err+")";
                }
            }
            if(this.result!=undefined) var file = this.result;
            else { 
                g_or_b("file undefined");
                return;
            }
            try{
                if(filere.test(file.name)){
                    var nm  = document.createElement("option");
                    nm.textContent = file.name;
                    count++;
                    lbl.textContent = "File found: " + file.name;
                    sel.appendChild(nm);
                }
            }catch(e) {
                g_or_b("unknown");
                return;
            }
            //alert("File found");
            // Once we found a file we check if there is other results
            if (!this.done) {
            // Then we move to the next result, which call the cursor
            // success with the next file as result.
                this.continue();
            } else {
                g_or_b("unknown");
                return;
            }
            //dict.get_dbs();
        }
        cursor.onerror = function () {
          console.warn("No file found "+this.error);
          lbl.textContent = badtext;
        }
    }
    function makepos(x){
        x = x||0;
        //console.log("makepos, x==", x);
        var re = /.+?\..+?/, result = x;
        if(re.test(x)) result = parseFloat(x);
        else result = parseInt(x);
        if(isNaN(x) && x<0) result = 0;
        return result;
    }
    function get_cr(keys, callback, evt){
        crstorage.get(keys, function(result){
                //console.log("Got "+JSON.stringify(result)+"from storage, keys was "+keys);
                for(var key in result){
                    callback( key, result[key] );//currentpp[ps[key]] = makepos(result[key]);
                    //console.log("Got "+result[key]+" from "+key+"  ."+keys[key]);
                }
                if(evt) callbacks[evt]();//evo.dispatchEvent(evt);
            });
    }
    function get_ls(keys, callback, evt){
        //console.log("Got keys "+keys);
        for(var key in keys){
            //console.log("Got key "+keys[key]);
            callback( keys[key], storage.getItem(keys[key]) );//currentpp[ps[key]] = makepos(storage.getItem(key));
            //console.log("Got "+storage.getItem(keys[key])+" from "+key+"  ."+keys[key]);
        }
        if(evt) callbacks[evt]();//evo.dispatchEvent(evt);//got_pp_ev);
    }
    function get_opt(keys, callback, evt){
        if(hasStorage) get_ls(keys, callback, evt);
        else if(crstorage) get_cr(keys, callback, evt);
        else if(evt) callbacks[evt]();//evo.dispatchEvent(evt);
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
        for(var key in datas){
            type = typeof(datas[key][0]);
            //console.log(type);
            if(type=="object") create_select(opts_brd, datas[key][1], datas[key][0], key, datas[key][2]);
            if(type=="string") create_input(opts_brd, datas[key][1], datas[key][0], key, datas[key][2]);
        }
    }
    function add_dbs(sel, _nm, txt){
        var arr = txt.replace(/\"/g, "").split("\n");
        var start = arr.length-4;
        var reend = /110.+?present/;
        var itms = [];
        while(sel.firstChild) {delete sel.removeChild(sel.firstChild);}
        sel.appendChild(_nm);
        for(var i = start; i>0; i--){
            if(reend.test(arr[i])) { /*console.log("The end "+arr[i]);*/ return;}
            else{ 
                var itms = arr[i].split(" ");
                var nm  = document.createElement("option");
                nm.value = itms[0];
                nm.textContent = arr[i].replace(itms[0]+" ", '');
                sel.appendChild(nm);
                //console.log(itms);
            }
        }
    }
    function remove_key(key){
        if(storage){
            storage.removeItem(key);
        } else if(crstorage) {
            var keys = [];
            keys.push(key);
            crstorage.remove(keys, function(){console.log(key+" removed");}) 
        }
    }

    function remove_old(items){
        var keys = Object.keys(items);
        var timekeys = keys.filter(function(str){return str.match(/.+?_time/);});
        var time = Date.now()-259200;//0000;//Month for all
        var badtimekeys = timekeys.filter(function(key){return items[key] < time});
        var badprefixes = badtimekeys.map(function(item, i, arr){return item.replace(/(.+?)_time/, "$1");});
        console.log("badprefixes == "+badprefixes);
        var re = new RegExp("("+badprefixes.join("|")+")_(.+)");
        var badkeys = keys.filter(function(str){return str.match(re);});
        console.log("badkeys == "+badkeys);
        time = Date.now()-259200;//000;     //3 days for a single page
        badtimekeys = timekeys.filter(function(key){return items[key] < time});
        badprefixes = badtimekeys.map(function(item, i, arr){return item.replace(/(.+?)_time/, "$1");});
        console.log("badprefixes == "+badprefixes);
        re = new RegExp("("+badprefixes.join("|")+")_last_html");
        badkeys = badkeys.concat(keys.filter(function(str){return str.match(re);}));
        re = new RegExp(filename+"_(.+?)");
        badkeys = badkeys.filter(function(str){return !str.match(re);});
        badkeys.map(function(item, i, arr){remove_key(item);});
        console.log("badkeys == "+badkeys);
    }

    function get_all_itms(callback){
        if(storage) {
            var items = {}; var i = 0; var key = null;
            for (;key = storage.key(i); i++) items[key] = storage.getItem(key);
            console.log("going remove..");
            callback(items);
            console.log("remove done.");
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
        console.log("Saved "+prckey+" as "+currentpp['percent']+pnmkey+" as "+currentpp['page']);
    }
    function getpp(){
        currentpp = {'page':0, 'percent':0};
        var prckey = filename+"_prc", pnmkey = filename+"_pnm";
        var ps = {};
        ps[prckey] = 'percent';
        ps[pnmkey] = 'page';
        get_opt(Object.keys(ps), function(key, val){
                currentpp[ps[key]] = makepos(val);
                console.log(key+"=got="+val);
            }, 'got_pp');
    }

    check_params([hasgoogle, hassocket, fill_params]);
        //sp.className = "spflex";

    return{
            display:function(mode){
                display(mode);
            },
            config:function(){
                return values;//get_config();
            },
            bookfile:function(){
                return file;//document.getElementById('file').files[0];
            },
            remove_opt:function(key){
                remove_key(filename+"_"+key);
            },
            set_opt:function(key, val){
                set_opt(filename+"_"+key, val);
            },
            remove_old:function(){
                get_all_itms(remove_old);
            },
            get_opt:function(key, callback){
                var ps = [];
                ps.push(filename+"_"+key);
                get_opt(ps, function(ky, vl){callback(vl);}, null);
            },
            savepp:function(){
                savepp();
            },
            getpp:function(){
                getpp();
                //callback( key, result[key] );//currentpp[ps[key]] = makepos(result[key]);
            },
            setpercent:function(percent){
                if(isNaN(percent)) currentpp['percent'] = 0;
                else currentpp['percent'] = percent;
                //this.savepp();
                //console.log("set currentpercent=="+percent);
                lbl.textContent = parseInt(percent)+"% of current chapter";
            },
            msg:function(text){
                if(text) lbl.textContent = text;
                else return lbl.textContent;
            },
            getpercent:function(){
                return currentpp['percent'];
            },
            setpage:function(page){
                if(isNaN(page)) currentpp['page'] = 0;
                else currentpp['page'] = page;
                //this.savepp();
                console.log("set currentpage=="+page);
            },
            getpage:function(){
                return currentpp['page'];
            },
            add_callback:function(key, fcn){
                callbacks[key] = fcn;
            },
            filename:function(){
                return filename;
            }
    };
  }
);
