define(
  ['dict'],
  function(dict){
    /*var evo = document.createElement("br");
    var got_file_ev = new Event('got_file');
    var got_pp_ev = new Event('got_pp');*/
    var callbacks = {'got_file':function(){}, 'got_pp':function(){}};
    var opts_brd =    document.getElementById('options');
    var opts_brd_b = document.getElementById('options_block');
    //opts_brd_b.style.border = "1px";
    //opts_brd.style.width = "100%";
   // opts_brd.style.display = 'none';
    opts_brd.textContent = '';
    var storage = null;// || 
    try { storage = localStorage } catch(e) {console.warn("localStorage not available");}
    var crstorage = null;
    try{ crstorage = chrome.storage.local;} catch(e) {console.warn("chrome.storage not available");}
    var type;
    var file = {'name':'empty'};
    var currentpp = {'page':0, 'percent':0};
    var datas = {
        dict_src: [['google', 'dictd proxy', 'socket'], "Select dictionary source"],
        dict_db: [['!'], "Dict db (! means all)"],
        socket_host: ['192.168.0.2', "dictd host"],
        socket_port: ['2628', "dictd port"],
        proxy_host: ['192.168.0.2', "proxy host"],
        proxy_port: ['8082', "proxy port"],
        dsfile: [[], 'Select a file'],
        file: ['', ""]
    };
    var hasStorage = (function() {
      try {
        localStorage.setItem('try', 'try');
        localStorage.removeItem('try');
        return true;
        storage = localStorage;
      } catch(e) {
        return false;
      }
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
        var cs = 0, ms = 0;
        callbacks.splice(0,1);
        try{ cs = chrome.socket } catch(e) { console.warn(e.stack);}
        try{ ms = navigator.mozTCPSocket} catch(e) { console.warn(e.stack);}
        if(!(cs || ms)){
            datas['dict_src'][0].splice(datas['dict_src'][0].indexOf('socket'),1);
            //delete datas['socket_host'];
            //delete datas['socket_port'];
        }
        console.log("checked socket");
        callbacks[0](callbacks);
    }
    //var winstyle = element.currentStyle || window.getComputedStyle(element, null);
    function create_select(obj, name, elements, key){
        var sel = document.createElement("select");
        var nm  = document.createElement("option");
        var br  = document.createElement("br");
        var sp  = document.createElement("span");
        nm.textContent = name;
        nm.selected = 1;
        nm.disabled = 1;
        sel.appendChild(nm);
        sel.id = key;
        sel.style.width = "75%";
        //<device storage
        if(key==="dict_db"){
            dict.add_callback('got_dbs', function(_txt){add_dbs(sel, nm, _txt);});
            dict.get_dbs();
        }else if(key==="dsfile"){
            if (navigator.getDeviceStorage) {
                try { parse_storage(sel, obj);}
                catch(e) {console.warn("Parse storage failed, got"+e.stack);}
                sel.addEventListener("change", 
                                function (event){
                                    var filename = event.target.options[event.target.selectedIndex].value;
                                    console.log("Select file changed "+filename);
                                    var sdcard = navigator.getDeviceStorage('sdcard');
                                    var request = sdcard.get(filename);
                                    request.onsuccess = function () {  file = this.result;
                                                                       console.log("Got the file: "+file.name); 
                                                                       //evo.dispatchEvent(got_file_ev);
                                                                       callbacks['got_file']();}
                                    request.onerror = function () { console.warn("Unable to get the file: " + this.error); }
                                }, false);
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
        sel.onchange = function(evt){get_config();};
        sp.appendChild(sel);
        obj.appendChild(sp);
        obj.appendChild(br);
    }
    function create_input(obj, name, value, key){
        var sel = document.createElement("label");
        var inp = document.createElement("input");
        var br  = document.createElement("br");
        var sp  = document.createElement("span");
        sel.textContent = name;
        inp.id = key;
        inp.style.left="0px";
        if(key==="file") {   inp.type = 'file';
                             inp.addEventListener("change", function (event){
                                                            file = event.target.files[0];
                                                            //evo.dispatchEvent(got_file_ev);
                                                            callbacks['got_file']();}, false );
                         }
        else {
            inp.value = value;
            var params = [];
            params[0] = inp.id;
            get_opt(params, function(key, value){console.log(key+"=got="+value); if(value) inp.value = value;},null);
            inp.type = 'text';
            inp.onchange = function(evt){get_config(); input = evt.target; set_opt(input.id, input.value); 
                                        dict.init_params({"dictionary": values["dict_src"], "host": values["socket_host"], "port": parseInt(values["socket_port"])});
                                        dict.get_dbs();};
        }
        sp.appendChild(sel);
        sp.appendChild(inp);
        obj.appendChild(sp);
        obj.appendChild(br);
    }
    function display(mode){
        console.log(mode, opts_brd_b.style.display, opts_brd.style.display);
        if(mode==='show')
            //opts_brd.parentNode.display='block';
            if(opts_brd_b.style.display==='none') opts_brd_b.style.display='block';
            else{console.log("go_flex"); opts_brd.parentNode.style.display='block';}
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
        console.log("Got config: "+JSON.stringify(values));
        return values;
    }
    function parse_storage(sel, obj){
        var pics = navigator.getDeviceStorage('sdcard');
        // Let's browse all the images available
        var cursor = pics.enumerate();
        var count = 0;
        var self = this;
        window.setTimeout(function(){self.return}, 2048);
        cursor.onsuccess = function () {
            if(this.result!='undefined') var file = this.result;
            else this.continue();
            try{
            var nm  = document.createElement("option");
                nm.textContent = file.name;
                count++;
                console.log("File found: " + file.name);
                sel.appendChild(nm);
                obj.appendChild(sel);
            }catch(e) { console.warn(e.stack); return;}
            //alert("File found");
            // Once we found a file we check if there is other results
            if (!this.done) {
            // Then we move to the next result, which call the cursor
            // success with the next file as result.
                this.continue();
            } else {
                console.log(count+" files found");
                obj.appendChild(sel);
            }
            get_config();
            dict.init_params({"dictionary": values["dict_src"], "host": values["socket_host"], "port": parseInt(values["socket_port"])});
            dict.get_dbs();
        }
        cursor.onerror = function () {
          var nm  = document.createElement("option");
          nm.textContent = "No file found: " + this.error.textContent
          sel.appendChild(nm);
          obj.appendChild(sel);
          alert("No file found");
        }
        //alert("The end");
        //var nm  = document.createElement("option");
        //nm.textContent = "The end."
        //sel.appendChild(nm);
    }
    function makepos(x){
        x = x||0;
        console.log("makepos, x==", x);
        var re = /.+?\..+?/, result = x;
        if(re.test(x)) result = parseFloat(x);
        else result = parseInt(x);
        if(isNaN(x) && x<0) result = 0;
        return result;
    }
    function get_cr(keys, callback, evt){
        crstorage.get(keys, function(result){
                //console.log("Got "+JSON.stringify(result)+"from storage, was "+Object.keys(ps));
                for(var key in Object.keys(result)){
                    callback( key, result[key] );//currentpp[ps[key]] = makepos(result[key]);
                    //console.log("Got "+result[key]+" from "+key);
                }
                if(evt) callbacks[evt]();//evo.dispatchEvent(evt);
            });
    }
    function get_ls(keys, callback, evt){
        //console.log("Got keys "+keys);
        for(var key in keys){
            //console.log("Got key "+keys[key]);
            callback( keys[key], storage.getItem(keys[key]) );//currentpp[ps[key]] = makepos(storage.getItem(key));
            //console.log("Got "+storage.getItem(key)+" from "+key+"->"+currentpp[ps[key]]+" stored into "+ps[key]);
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
        crstorage.set({key: p}, function(){console.log(p+" saved as "+key);});
    }
    function set_ls(key, p){
        localStorage.setItem(key, p);
    }
    function fill_params(callbacks){
        for(var key in datas){
            type = typeof(datas[key][0]);
            //console.log(type);
            if(type=="object") create_select(opts_brd, datas[key][1], datas[key][0], key);
            if(type=="string") create_input(opts_brd, datas[key][1], datas[key][0], key);
        }
    }
    function add_dbs(sel, _nm, txt){
        var arr = txt.split("\n");
        var start = arr.length-4;
        var reend = /110.+?present/;
        var itms = [];
        while(sel.firstChild) {delete sel.removeChild(sel.firstChild);}
        sel.appendChild(_nm);
        for(var i = start; i>0; i--){
            if(reend.test(arr[i])) { console.log("The end "+arr[i]); return;}
            else{ 
                var itms = arr[i].split(" ");
                nm  = document.createElement("option");
                nm.value = itms[0];
                nm.textContent = itms[1];
                sel.appendChild(nm);
                console.log(itms);
            }
        }
    }
    check_params([hasgoogle, hassocket, fill_params]);
    var toc = document.createElement("div");
    toc.id = "toc";
    opts_brd_b.appendChild(toc);
    var lbl = document.createElement("label");
    lbl.style.order = "99";
    lbl.textContent = "";
    opts_brd_b.appendChild(lbl);
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
            savepp:function(){
                var prckey = file.name+"_prc", pnmkey = file.name+"_pnm";
                set_opt(prckey, currentpp['percent']);
                set_opt(pnmkey, currentpp['page']);
                console.log("Saved "+currentpp['percent']+"  "+currentpp['page']);
            },
            getpp:function(){
                var prckey = file.name+"_prc", pnmkey = file.name+"_pnm";
                var ps = {};
                ps[prckey] = 'percent';
                ps[pnmkey] = 'page';
                get_opt(Object.keys(ps), function(key, val){
                        currentpp[ps[key]] = makepos(val);
                        console.log(key+"=got="+val);
                    }, 'got_pp');
                //callback( key, result[key] );//currentpp[ps[key]] = makepos(result[key]);
            },
            setpercent:function(percent){
                if(isNaN(percent)) currentpp['percent'] = 0;
                else currentpp['percent'] = percent;
                //this.savepp();
                console.log("set currentpercent=="+percent);
                lbl.textContent = parseInt(percent)+"% of current chapter";
            },
            msg:function(text){
                lbl.textContent = text;
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
            }
            //evo:evo
    };
  }
);
