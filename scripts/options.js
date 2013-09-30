define(
  ['stuff'],
  function(stuff){
    var evo = document.createElement("br");
    var got_file_ev = new Event('got_file');
    var opts_brd = document.getElementById('options');
    opts_brd.style.width = window.innerWidth-16+"px";
    opts_brd.textContent = '';
    //var storage = chrome.storage.local;// || 
    var storage = localStorage;
    var type;
    var file = {'name':'empty'};
    var currentpercent = -1;
    var currentpage = -1;
    var datas = {
        dict_src: [['google', 'dictd proxy', 'socket'], "Select dictionary source"],
        socket_host: ['192.168.0.2', "dictd host"],
        socket_port: ['2628', "dictd port"],
        proxy_host: ['192.168.0.2', "proxy host"],
        proxy_port: ['8082', "proxy port"],
        dsfile: [[], 'Select a file'],
        file: ['', ""]
    };
    var values = null;
    //var winstyle = element.currentStyle || window.getComputedStyle(element, null);
    function create_select(obj, name, elements, key){
        var sel = document.createElement("select");
        var nm  = document.createElement("option");
        var br  = document.createElement("br");
        nm.textContent = name;
        nm.selected = 1;
        nm.disabled = 1;
        sel.appendChild(nm);
        sel.id = key;
        sel.style.width = opts_brd.style.width;
        //<device storage
        if(key==="dsfile"){
            if (navigator.getDeviceStorage) {
                try { parse_storage(sel, obj);}
                catch(e) {console.warn("Parse storage failed, got"+e.stack);}
                sel.addEventListener("change", function (event){
                                                    var filename = event.target.options[event.target.selectedIndex].value;
                                                    console.log("Select file changed "+filename);
                                                    var sdcard = navigator.getDeviceStorage('sdcard');
                                                    var request = sdcard.get(filename);
                                                    request.onsuccess = function () {  file = this.result;
                                                                                       console.log("Got the file: "+file.name); 
                                                                                       evo.dispatchEvent(got_file_ev);}
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
        obj.appendChild(sel);
        obj.appendChild(br);
    }
    function create_input(obj, name, value, key){
        var sel = document.createElement("label");
        var inp = document.createElement("input");
        var br  = document.createElement("br");
        sel.textContent = name;
        inp.id = key;
        inp.style.left="0px";
        if(key==="file") {   inp.type = 'file';
                             inp.addEventListener("change", function (event){
                                                            file = event.target.files[0];
                                                            evo.dispatchEvent(got_file_ev);}, false );
                         }
        else inp.type = 'text';
        inp.value = value;
        obj.appendChild(sel);
        obj.appendChild(inp);
        obj.appendChild(br);
    }
    function display(mode){
        opts_brd.style.display = mode;
    }
    function get_config(){
        values = {};
        for(var key in datas){
            //type = typeof(datas[key][0]);
            values[key] = document.getElementById(key).value;
        }
        return values;
    }
    function parse_storage(sel, obj){
        var pics = navigator.getDeviceStorage('sdcard');
        // Let's browse all the images available
        var cursor = pics.enumerate();
        var count = 0;
        cursor.onsuccess = function () {
            if(this.result!='undefined') var file = this.result;
            else this.continue();
            var nm  = document.createElement("option");
            nm.textContent = file.name;
            count++;
            console.log("File found: " + file.name);
            sel.appendChild(nm);
            obj.appendChild(sel);
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
    for(var key in datas){
        type = typeof(datas[key][0]);
        //console.log(type);
        if(type=="object") create_select(opts_brd, datas[key][1], datas[key][0], key);
        if(type=="string") create_input(opts_brd, datas[key][1], datas[key][0], key);
    }
    var toc = document.createElement("div");
    toc.id = "toc";
    opts_brd.appendChild(toc);
    var lbl = document.createElement("label");
    lbl.textContent = "0%";
    opts_brd.appendChild(lbl);

    return{
            display:function(mode){
                display(mode);
            },
            config:function(){
                return get_config();
            },
            bookfile:function(){
                return file;//document.getElementById('file').files[0];
            },
            savepp:function(){
                try { storage.setItem(file.name+"_prc", currentpercent);
                      storage.setItem(file.name+"_pnm", currentpage);}
                catch(e){console.warn(e.stack);}
                //alert("For "+file.name+" data saved"+currentpercent+" "+currentpage);
            },
            setpercent:function(percent){
                currentpercent = percent;
                this.savepp();
                console.log("set currentpercent=="+currentpercent);
                lbl.textContent = parseInt(currentpercent)+"% of current chapter";
            },
            getpercent:function(){
                if(currentpercent===-1)
                    try{currentpercent = parseInt(storage.getItem(file.name+"_prc"));}
                    catch(e) {console.warn("get cpr failed, got "+e.stack); currentpercent = 0;}
                if(isNaN(currentpercent) || currentpercent<0) currentpercent=0;
                console.log(storage.getItem(file.name+"_prc")+" got currentpercent=="+currentpercent);
                return currentpercent;
            },
            setpage:function(page){
                currentpage = page;
                this.savepp();
                console.log("set currentpage=="+currentpage);
            },
            getpage:function(){
                if(currentpage===-1)
                    try{currentpage = parseInt(storage.getItem(file.name+"_pnm"));}
                    catch(e) {console.warn("get cpg failed, got "+e.stack); currentpage = 0;}
                if(isNaN(currentpage) || currentpage<0) currentage=0;
                console.log(storage.getItem(file.name+"_pnm")+" got currentpage=="+currentpage);
                return currentpage;
            },
            evo:evo
    };
  }
);
