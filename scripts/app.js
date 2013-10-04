require(['uitouch', 'dict', 'options', 'book', 'stuff'], function(uitouch, dict, options, book, stuff){
    console.log("app.js loads");
    //var ongoingTouches = new Array;
    var ws = null;
    var dreq = null;
    var timer = null;
    var sxG = 0;
    var syG = 0;
    var reb = /k\>/g;
    var retr = /\<\/?tr\>/g;
    var ren = /[\f\n\r\v]{3}/g;
    var moveflag = 0;
    var dtext = null;
    var txarea = document.getElementById('txtarea');
    var fl_text = document.getElementById('fl_text');
    var ta_rectObject = txarea.getBoundingClientRect();
    txarea.style.height = (window.innerHeight - ta_rectObject.top - 1)+"px";
    txarea.style.width = window.innerWidth+"px";
    //fl_text.style.height = window.innerHeight+"px";
    fl_text.style.width =  "auto";
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = 'img { max-height: '+parseInt(window.innerHeight)+'px; max-width:'+parseInt(window.innerWidth)+'px;}';
    document.getElementsByTagName('head')[0].appendChild(style);
    var dt = document.getElementById("pop");
    dt.addEventListener("touchstart", function(e){uitouch.handleTouchstart(e,'pop');}, false);
    dt.addEventListener("touchend", function(e){uitouch.handleTouchend(e,'pop');}, false);
    dt.addEventListener("touchmove", function(e){uitouch.handleTouch(e,'pop');}, false);
    var marea = document.getElementById("maintext");
    marea.style.top = "0px";
    marea.addEventListener("touchstart", function(e){uitouch.handleTouchstart(e,'body');}, false);
    marea.addEventListener("touchend", function(e){uitouch.handleTouchend(e,'body');}, false);
    marea.addEventListener("touchmove", function(e){uitouch.handleTouch(e,'body');}, false);
    try { window.addEventListener("beforeunload", options.savepp);}
    catch (e) { chrome.app.window.current().onClosed.addListener(function(){options.savepp();});}
    uitouch.evo.addEventListener('got_selection', function (e) { thumb_block(uitouch.max_Y(), uitouch.selected_word(), 'block'); }, false);
    uitouch.evo.addEventListener('next_chapter', function (event) {
            var sel = document.getElementById("tocselect");
            var diff = parseInt(event.target.id);
            //console.log('next_chapter='+idx);
            var page = book.foliant().next_page(diff); 
            if(page!=-1){
                fill_page(page, 0);
                var newsel = book.foliant().option(sel.selectedIndex);
                sel.options[newsel].selected = true;
                if(event.target.id==="-1"){
                    var ptop = parseInt(marea.parentNode.parentNode.offsetHeight);
                    var marect = marea.getBoundingClientRect();
                    marea.style.top = (-(parseInt(marect.height) - ptop/2))+"px";
                }
            }
        }, false);
    //console.log(options);
    //options.button()
    options.evo.addEventListener('got_file', function (e) {
            console.log("Got file event fired");
            var evo = book.init(options.bookfile());
            evo.addEventListener('got_book', function () {console.log("Got book"); fill_toc(book.get_page(-1));}, false);
            book.load();
        }, false);
    
    function fill_toc(html){
        //console.log(html);
        var opts = document.getElementById("options");
        var toc = document.getElementById("toc");
        opts.removeChild(toc)
        var ntoc = document.createElement("div");
        ntoc.id = "toc";
        ntoc.appendChild(html);
        opts.appendChild(ntoc);
        var sel = document.getElementById("tocselect");
        //sel.style.width = window.innerWidth-16+"px";
        sel.addEventListener("change", function (event){console.log("Select changed"); marea.style.top="0px"; 
                                                fill_page(book.foliant().get_fromopt(event.target.selectedIndex), 0);} );
        options.evo.addEventListener('got_pp', function (e) {
                                                    fill_page(book.foliant().get_page( options.getpage() ), options.getpercent() ); 
                                                    var sel = document.getElementById("tocselect");
                                                    var newsel = book.foliant().option(sel.selectedIndex);
                                                    if(sel.options[newsel]) sel.options[newsel].selected = true;
                                                });
        options.getpp();
    }
    function fill_page(html, percent){
        console.log("Try load html");
        marea.style.width = 'auto';
        marea.style.height = 'auto';
        marea.innerHTML = html;
        var cstyle = marea.getBoundingClientRect();//window.getComputedStyle(marea, null);
        if(parseInt(cstyle.height) < parseInt(txarea.style.height)){
            marea.style.height = txarea.style.height;
            console.log(cstyle.height+" < "+txarea.style.height);
        }
        marea.style.top = parseInt(-percent*parseInt(cstyle.height)/100)+"px";
        options.setpage(book.foliant().currentpage());
        options.setpercent(percent);
        options.savepp();
    }
    function fill_thumb(text){
        var cl = document.getElementById('pts');
        var el = document.getElementById('pop');
        var cf = 0.1;
        var width = parseInt(el.style.width, 10);
        dtext = text.replace(reb, "strong>").replace(retr, "/").replace(ren, "<br>").replace(/220[\s\S.]+?\s\d\d\d\s/, '');//.replace(/<.*>\n/, '');
        cl.innerHTML = dtext;
    }
    function thumb_block(mY, word, disp) {
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        var pos = 0;
        if(el){
            if(disp!='none'){
                var config = options.config();
                console.log("Got config "+config);
                ptop = parseInt(txarea.style.height);//marea.parentNode.parentNode.offsetHeight;
                console.log("mY vs ptop"+mY+" "+ptop);
                if(mY < ptop/2) pos = 'bot';
                else pos = 'top';
                cl.style.top = "0px";
                if(pos==='top'){el.style.top = 0; el.style.bottom = '85%';}// db.style.display='none'; dt.style.display=disp;}
                if(pos==='bot'){el.style.bottom = 0; el.style.top = '85%';}// dt.style.display='none'; db.style.display=disp;}
                    dict.init_params({"text": "value", "dictionary": config["dict_src"], "host": config["socket_host"], "port": parseInt(config["socket_port"]),
                                        "local_base_url": "http://"+config["proxy_host"]+":"+config["proxy_port"]+"/?"});
                    dict.dreq.addEventListener('got_def', function (e) { fill_thumb(dict.response()); }, false);
                    dict.get_def(word);
            }
            el.style.display = disp;
        }
    }
});
