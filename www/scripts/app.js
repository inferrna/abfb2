require(['uitouch', 'dict', 'options', 'book', 'stuff', 'sound', 'sharedc', 'require', 'images', 'hammer'],
function(uitouch, dict, options, book, stuff, sound, sharedc, require){
    console.log("app.js loads");//NFP
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
    var mtext = document.getElementById('maintext');
    var fl_text = document.getElementById('fl_text');
    var ta_rectObject = txarea.getBoundingClientRect();
    var hammer = require('hammer');
    txarea.style.height = (window.innerHeight - ta_rectObject.top + 1)+"px";
    txarea.style.width = window.innerWidth+"px";
    fl_text.style.width =  "auto";
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = 'img { max-height: '+parseInt(window.innerHeight-64)+'px; max-width:'+parseInt(window.innerWidth-64)+'px; overflow:hidden}';
    document.getElementsByTagName('head')[0].appendChild(style);
    var sndcnt = document.getElementById('sndcnt');
    var sndbt = document.getElementById('sndbt');
    var nosnd = document.getElementById('nosnd');
    /*sndbt.onclick=function(){sound.play(sndcnt);};
    sndbt.style.height = Math.round(32*(window.devicePixelRatio || 1.0))+"px";
    sndbt.style.width = sndbt.style.height;
    sndbt.style.backgroundImage = 'url('+stuff.sndimg+')';*/
    var pts = document.getElementById("pts");
    var pop = document.getElementById("pop");
    var marea = document.getElementById("maintext");
    var helper = document.getElementById("helper");
    marea.style.top = "0px";
    txarea.style.backgroundSize = '100%';
    if ( window.cordova ) {
        var images = require("images");
        if(window.innerWidth<512) txarea.style.backgroundImage = 'url('+images.img_tiny+')';
        else if (window.innerWidth<1024) txarea.style.backgroundImage = 'url('+images.img_small+')';
        else txarea.style.backgroundImage = 'url('+images.img+')';
    } else {
        if(window.innerWidth<512) txarea.style.backgroundImage='url(../images/back_tiny.jpg)';
        else if (window.innerWidth<1024) txarea.style.backgroundImage='url(../images/back_small.jpg)';
        else txarea.style.backgroundImage='url(../images/back.jpg)';
    }
    var drvhds = Math.min(Math.floor(window.innerHeight/3), Math.floor(window.innerWidth/3));
    hammer(txarea).on("dragleft", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(mtext, -1); pop.style.display='none';}});
    hammer(txarea).on("dragright", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(mtext, 1); pop.style.display='none';}});
    hammer(txarea).on("dragup", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); options.display('hide'); pop.style.display='none';}});
    hammer(txarea).on("dragdown", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); options.display('show'); pop.style.display='none';}});
    hammer(mtext).on("pinchin", function(evt){uitouch.doscale(evt.gesture.scale);});
    hammer(mtext).on("pinchout", function(evt){uitouch.doscale(evt.gesture.scale);});
    hammer(pop).on("dragleft",  function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(pts,-1);}});
    hammer(pop).on("dragright", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(pts, 1);}});
    hammer(pop).on("dragup",   function(evt){uitouch.dragpop(evt.gesture.center.pageY);});
    hammer(pop).on("dragdown", function(evt){uitouch.dragpop(evt.gesture.center.pageY);});
    mtext.addEventListener("click", function(e){uitouch.handleClick(e);}, false);
    mtext.addEventListener("select", function(e){uitouch.handleSelect(e);}, false);
    console.log("VER 1");//NFP
    hammer(helper).on("tap", function(evt){helper.style.display="none";});
    helper.addEventListener("click", function(e){helper.style.display="none";}, false);
    window.addEventListener("keydown", function(e){uitouch.handleKey(e);}, false);
    //window.addEventListener("", function(e){uitouch.handlegest(e);}, false);
    var opt_bl = document.getElementById("options_block");
    try { window.addEventListener("beforeunload", function(){ console.log("saving.."); options.savepp();});}
    catch (e) { chrome.app.window.current().onClosed.addListener(function(){console.log("saving.."); options.savepp();});}
    sharedc.register('uitouch', 'got_selection', function (texts) { thumb_block(uitouch.max_Y(), texts, 'block'); });
    sharedc.register('uitouch', 'next_chapter', function (i) {
            var sel = document.getElementById("tocselect");
            var diff = parseInt(i);
            var page = book.foliant().next_page(diff); 
            if(page!=-1){
                fill_page(page, 0);
                var newsel = book.foliant().option(sel.selectedIndex);
                sel.options[newsel].selected = true;
                if(diff===-1){
                    var ptop = parseInt(marea.parentNode.parentNode.offsetHeight);
                    var top = (-(parseInt(stuff.getStyle(marea, 'height')) - 3*ptop/4));
                    top = top>0 ? 0 : top;
                    marea.style.top = parseInt(top)+"px";
                }
                var el_rectO = marea.getBoundingClientRect();
                options.setpercent(-100*parseInt(el_rectO.top)/el_rectO.height);
                console.log("saving.."); options.savepp();
            }
        });
    sharedc.register('dict', 'got_def', function (txt, els) {
        dict.push_cache(txt);
        if(txt.length>1) fill_thumb(txt, els);
        else fill_thumb("Something went wrong. Please check your options.");
    });
    sharedc.register('bookng', 'got_toc', function () {console.log("Got toc"); fill_toc(book.get_page(-1)); uitouch.init_scale();});
    sharedc.register('book', 'got_book', function () {console.log("Got book"); uitouch.init_scale();});
    sharedc.register('options', 'got_file', function () {
            options.remove_old();
            book.init(options.bookfile());
            book.load();
        });
    sharedc.register('bookng', 'got_fstfile', function(){
        var html = null;
        var i = options.getpage();
        if(book.foliant()) html = book.foliant().get_page(i);
        console.log("got html:");//NFP
        console.log(html);//NFP
        if(html){
            fill_page(html, options.getpercent()); 
            var sel = document.getElementById("tocselect");
            var newsel = book.foliant().option(sel.selectedIndex);
            if(sel.options[newsel]) sel.options[newsel].selected = true;
        }
    });    
    sharedc.register('options', 'got_pp', function () {
                                                var i = options.getpage();
                                                var href = book.foliant().get_href_byidx(i);
                                                console.log("href2get: "+href);//NFP
                                                sharedc.exec('app', 'got_href')(href);
                                            });
    
    function fill_toc(html){
        var opts = document.getElementById("options_block");
        var toc = document.getElementById("toc");
        var dtoc = toc.parentNode;
        dtoc.removeChild(toc)
        var ntoc = document.createElement("div");
        ntoc.id = "toc";
        ntoc.appendChild(html);
        dtoc.appendChild(ntoc);
        var sel = document.getElementById("tocselect");
        sel.style.width = Math.min(parseInt(window.innerWidth)-24, parseInt(stuff.getStyle(sel, 'width')))+"px";
        sel.addEventListener("change", function (event){/*console.log("Select changed");*/ marea.style.top="0px"; 
                                                fill_page(book.foliant().get_fromopt(event.target.selectedIndex), 0);} );
        options.getpp();
    }
    function fill_page(html, percent, nosave){
        marea.style.width = 'auto';
        marea.style.height = 'auto';
        marea.innerHTML = html;
        var fs = parseInt(stuff.getStyle(marea, 'font-size'));
        var cheight = parseInt(stuff.getStyle(marea, 'height'));//window.getComputedStyle(marea, null);
        marea.style.top = parseInt(-percent*parseFloat(cheight)/100.0)+"px";
        if(!nosave) {
            options.setpage(book.foliant().currentpage());
            options.setpercent(percent);
            console.log("saving..");  options.savepp();
        }
    }
    function fill_thumb(text, els){
        if(text.length > 1){
            var cl = document.getElementById('pts');
            var el = document.getElementById('pop');
            var cf = 0.1;
            var width = parseInt(el.style.width, 10);
            dtext = text.replace(reb, "strong>").replace(retr, "/").replace(ren, "<br>").replace(/220[\s\S.]+?\s\d\d\d\s/, '');//.replace(/<.*>\n/, '');
            cl.innerHTML = dtext;
            sndbt.appendChild(sndcnt);
            cl.appendChild(sndbt);
            cl.appendChild(nosnd);
            el.style.display = 'block';
            if(els && els.length){
                for(var i = 0; i<els.length; i++){
                    cl.appendChild(document.createElement("br"));
                    cl.appendChild(els[i]);
                }
            }
            sndbt.style.display = 'block';
            uitouch.dragpop(-1);
            sndbt.style.display = 'none';
            //sndbt.disabled=true;
            sound.get_sound(dict.lword(), dict.lang());
        } else {el.style.display = 'none';}
    }
    function thumb_block(mY, texts, disp) {
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        cl.innerHTML = "Sending request..";
        var pos = 0;
        if(el){
            if(disp!='none'){
                var config = options.config();
                var ptop = parseInt(txarea.style.height);//marea.parentNode.parentNode.offsetHeight;
                if(mY < ptop/2) pos = 'bot';
                else pos = 'top';
                cl.style.top = "0px";
                if(pos==='top'){
                      el.style.top = 0+"px"; el.style.bottom = '99%';
                    }// db.style.display='none'; dt.style.display=disp;}
                if(pos==='bot'){el.style.bottom = 0+"px"; el.style.top = '99%';}// dt.style.display='none'; db.style.display=disp;}
                    /*dict.init_params({"text": "value", "dictionary": config["dict_src"], "host": config["socket_host"], "port": parseInt(config["socket_port"]),
                                        "phost": config['proxy_host'], "pport": config['proxy_port'], "db": config["dict_db"],
                                        "sl": config["lang_f"], "hl": config["lang_t"], "tl": config["lang_t"]});*/
                    dict.get_def(texts);
            } else {el.style.display = disp;}
        }
    }
});
