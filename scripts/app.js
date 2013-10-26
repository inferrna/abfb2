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
    document.addEventListener('deviceready', function(e){console.log("Device ready");}, false);
    txarea.style.height = (window.innerHeight - ta_rectObject.top + 1)+"px";
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
    txarea.style.backgroundSize = '100%';
    if(window.innerWidth<512) txarea.style.backgroundImage='url(../images/back_tiny.jpg)';
    else if (window.innerWidth<1024) txarea.style.backgroundImage='url(../images/back_small.jpg)';
    else txarea.style.backgroundImage='url(../images/back.jpg)';
    txarea.addEventListener("touchstart", function(e){uitouch.handleTouchstart(e,'body');}, false);
    txarea.addEventListener("touchend", function(e){uitouch.handleTouchend(e,'body');}, false);
    txarea.addEventListener("touchmove", function(e){uitouch.handleTouch(e,'body');}, false);
    txarea.addEventListener("select", function(e){uitouch.handleSelect(e);}, false);
    txarea.addEventListener("click", function(e){uitouch.handleClick(e);}, false);
    window.addEventListener("keydown", function(e){uitouch.handleKey(e);}, false);
    var opt_bl = document.getElementById("options_block");
    opt_bl.addEventListener("touchstart", function(e){uitouch.handleTouchstart(e,'opts');}, false);
    opt_bl.addEventListener("touchend", function(e){uitouch.handleTouchend(e,'opts');}, false);
    opt_bl.addEventListener("touchmove", function(e){uitouch.handleTouch(e,'opts');}, false);
    try { window.addEventListener("beforeunload", options.savepp);}
    catch (e) { chrome.app.window.current().onClosed.addListener(function(){options.savepp();});}
    uitouch.add_callback('got_selection', function (texts) { thumb_block(uitouch.max_Y(), texts, 'block'); });
    uitouch.add_callback('next_chapter', function (i) {
            var sel = document.getElementById("tocselect");
            var diff = parseInt(i);
            //console.log('next_chapter='+idx);
            var page = book.foliant().next_page(diff); 
            if(page!=-1){
                fill_page(page, 0);
                var newsel = book.foliant().option(sel.selectedIndex);
                sel.options[newsel].selected = true;
                if(diff===-1){
                    var ptop = parseInt(marea.parentNode.parentNode.offsetHeight);
                    var marect = marea.getBoundingClientRect();
                    var top = (-(parseInt(marect.height) - 3*ptop/4));
                    top = top>0 ? 0 : top;
                    //console.log("Backwards, top=="+top);
                    marea.style.top = parseInt(top)+"px";
                }
                var el_rectO = marea.getBoundingClientRect();
                options.setpercent(-100*parseInt(el_rectO.top)/el_rectO.height);
                options.savepp();
            }
        });
    dict.add_callback('got_def', function (txt) {
        if(txt.length>1) fill_thumb(txt);
        else fill_thumb("Something went wrong. Please check your options.");
    });
    //console.log(options);
    //options.button()
    options.add_callback('got_file', function () {
            //console.log("Got file event fired");
            book.init(options.bookfile());
            book.foliant().add_callback('got_book', function () {console.log("Got book"); fill_toc(book.get_page(-1));});
            book.load();
        });
    
    function fill_toc(html){
        //console.log(html);
        var opts = document.getElementById("options_block");
        var toc = document.getElementById("toc");
        var dtoc = toc.parentNode;
        dtoc.removeChild(toc)
        var ntoc = document.createElement("div");
        ntoc.id = "toc";
        ntoc.appendChild(html);
        dtoc.appendChild(ntoc);
        var sel = document.getElementById("tocselect");
        //sel.style.width = window.innerWidth-16+"px";
        sel.addEventListener("change", function (event){/*console.log("Select changed");*/ marea.style.top="0px"; 
                                                fill_page(book.foliant().get_fromopt(event.target.selectedIndex), 0);} );
        options.add_callback('got_pp', function () {
                                                    fill_page(book.foliant().get_page( options.getpage() ), options.getpercent() ); 
                                                    var sel = document.getElementById("tocselect");
                                                    var newsel = book.foliant().option(sel.selectedIndex);
                                                    if(sel.options[newsel]) sel.options[newsel].selected = true;
                                                });
        options.getpp();
    }
    function fill_page(html, percent){
        //console.log("Try load html");
        marea.style.width = 'auto';
        marea.style.height = 'auto';
        marea.innerHTML = html;
        var cstyle = marea.getBoundingClientRect();//window.getComputedStyle(marea, null);
        if(parseInt(cstyle.height) < (parseInt(txarea.style.height)-32)){
            marea.style.height = txarea.style.height-32;
            //console.log(cstyle.height+" < "+txarea.style.height);
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
    function thumb_block(mY, texts, disp) {
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        cl.innerHTML = "Sending request..";
        var pos = 0;
        if(el){
            if(disp!='none'){
                var config = options.config();
                //console.log("Got config "+config);
                var ptop = parseInt(txarea.style.height);//marea.parentNode.parentNode.offsetHeight;
                //console.log("mY vs ptop"+mY+" "+ptop);
                if(mY < ptop/2) pos = 'bot';
                else pos = 'top';
                cl.style.top = "0px";
                if(pos==='top'){el.style.top = 0; el.style.bottom = '85%';}// db.style.display='none'; dt.style.display=disp;}
                if(pos==='bot'){el.style.bottom = 0; el.style.top = '85%';}// dt.style.display='none'; db.style.display=disp;}
                    dict.init_params({"text": "value", "dictionary": config["dict_src"], "host": config["socket_host"], "port": parseInt(config["socket_port"]),
                                        "phost": config['proxy_host'], "pport": config['proxy_port'], "db": config["dict_db"],
                                        "sl": config["lang_f"], "hl": config["lang_t"], "tl": config["lang_t"]});
                    dict.get_def(texts);
            }
            el.style.display = disp;
        }
    }
});
