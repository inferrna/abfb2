require(['uitouch', 'dict', 'options', 'book', 'stuff', 'require', 'images', 'hammer'], function(uitouch, dict, options, book, stuff, require){
    console.log("app.js loads");
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
    style.innerHTML = 'img { max-height: '+parseInt(window.innerHeight)+'px; max-width:'+parseInt(window.innerWidth)+'px;}';
    document.getElementsByTagName('head')[0].appendChild(style);
    var snd = document.getElementById('snd');
    var pts = document.getElementById("pts");
    var pop = document.getElementById("pop");
    var marea = document.getElementById("maintext");
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
    var sndbt = document.getElementById('sndbt');
    sndbt.onclick=function(){console.log("sndbt clicked");snd.play();};
    sndbt.style.height = Math.round(32*(window.devicePixelRatio || 1.0))+"px";
    sndbt.style.width = sndbt.style.height;
    sndbt.style.backgroundImage = 'url('+stuff.sndimg+')';
    hammer(txarea).on("dragleft", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(mtext, -1); pop.style.display='none';}});
    hammer(txarea).on("dragright", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(mtext, 1); pop.style.display='none';}});
    hammer(txarea).on("dragup", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); options.display('hide'); pop.style.display='none';}});
    hammer(txarea).on("dragdown", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); options.display('show'); pop.style.display='none';}});
    hammer(mtext).on("pinchin", function(evt){uitouch.doscale(evt.gesture.scale);});
    hammer(mtext).on("pinchout", function(evt){uitouch.doscale(evt.gesture.scale);});
   /*hammer(txarea, {"swipe_velocity": 0.1}).on("swipeleft", function(evt){uitouch.liftcol(mtext, -1); pop.style.display='none';});
    hammer(txarea, {"swipe_velocity": 0.1}).on("swiperight", function(evt){uitouch.liftcol(mtext, 1); pop.style.display='none';});
    hammer(txarea, {"swipe_velocity": 0.1}).on("swipeup", function(evt){options.display('hide'); pop.style.display='none';});
    hammer(txarea, {"swipe_velocity": 0.1}).on("swipedown", function(evt){options.display('show'); pop.style.display='none';});*/
    hammer(pop).on("dragleft",  function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(pts,-1);}});
    hammer(pop).on("dragright", function(evt){if(evt.gesture.distance>=drvhds){evt.gesture.stopDetect(); uitouch.liftcol(pts, 1);}});
    hammer(pop).on("dragup",   function(evt){uitouch.dragpop(evt.gesture.center.pageY);});
    hammer(pop).on("dragdown", function(evt){uitouch.dragpop(evt.gesture.center.pageY);});
    //hammer(mtext).on("tap", function(evt){console.log("Got tap"); uitouch.handleClick(evt.gesture.srcEvent);});
    mtext.addEventListener("click", function(e){uitouch.handleClick(e);}, false);
    mtext.addEventListener("select", function(e){uitouch.handleSelect(e);}, false);
    window.addEventListener("keydown", function(e){uitouch.handleKey(e);}, false);
    //window.addEventListener("", function(e){uitouch.handlegest(e);}, false);
    var opt_bl = document.getElementById("options_block");
    try { window.addEventListener("beforeunload", function(){ console.log("saving.."); options.savepp();});}
    catch (e) { chrome.app.window.current().onClosed.addListener(function(){console.log("saving.."); options.savepp();});}
    uitouch.add_callback('got_selection', function (texts) { thumb_block(uitouch.max_Y(), texts, 'block'); });
    uitouch.add_callback('next_chapter', function (i) {
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
    dict.add_callback('got_def', function (txt, els) {
        dict.push_cache(txt);
        if(txt.length>1) fill_thumb(txt, els);
        else fill_thumb("Something went wrong. Please check your options.");
    });
    options.add_callback('got_file', function () {
            options.remove_old();
            options.getpp();
            options.get_opt("prc", function(prc){
                                       if(!prc) prc = options.getpercent();
                                       options.get_opt("last_html", function(html){
                                           uitouch.init_scale();
                                           fill_page(html, prc, 1);
                                       }, true);
                                    });
            book.init(options.bookfile());
            book.foliant().add_callback('got_book', function () {console.log("Got book"); fill_toc(book.get_page(-1)); uitouch.init_scale();});
            book.load();
        });
    options.add_callback('got_pp', function () {
                                                var html = null;
                                                if(book.foliant()) html = book.foliant().get_page(options.getpage());
                                                if(html){
                                                    fill_page(html, options.getpercent()); 
                                                    var sel = document.getElementById("tocselect");
                                                    var newsel = book.foliant().option(sel.selectedIndex);
                                                    if(sel.options[newsel]) sel.options[newsel].selected = true;
                                                }
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
        //sel.style.width = window.innerWidth-16+"px";
        sel.addEventListener("change", function (event){/*console.log("Select changed");*/ marea.style.top="0px"; 
                                                fill_page(book.foliant().get_fromopt(event.target.selectedIndex), 0);} );
        options.getpp();
    }
    function fill_page(html, percent, nosave){
        //console.log("Try load html");
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
            el.style.display = 'block';
            if(els && els.length){
                for(var i = 0; i<els.length; i++){
                    cl.appendChild(document.createElement("br"));
                    cl.appendChild(els[i]);
                }
            }
            dict.get_sound(function(url){
                    console.log("Got sound url: "+url);
                    if(url.match(/http\:\/\/.*/)){
                        sndbt.style.display = 'block';
                        snd.src = url;
                    } else {
                        sndbt.style.display = 'none';
                        }
                });
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
                if(pos==='top'){el.style.top = 0; el.style.bottom = '85%';}// db.style.display='none'; dt.style.display=disp;}
                if(pos==='bot'){el.style.bottom = 0; el.style.top = '85%';}// dt.style.display='none'; db.style.display=disp;}
                    /*dict.init_params({"text": "value", "dictionary": config["dict_src"], "host": config["socket_host"], "port": parseInt(config["socket_port"]),
                                        "phost": config['proxy_host'], "pport": config['proxy_port'], "db": config["dict_db"],
                                        "sl": config["lang_f"], "hl": config["lang_t"], "tl": config["lang_t"]});*/
                    dict.get_def(texts);
            } else {el.style.display = disp;}
        }
    }
});
