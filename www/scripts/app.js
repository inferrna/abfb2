require(['uitouch', 'dict', 'options', 'book', 'stuff', 'sound', 'sharedf', 'sharedc', 'require', 'advanced', 'log', 'hammer'],
function(uitouch, dict, options, book, stuff, sound, sharedf, sharedc, require, advanced, log){
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
    log.warn("Got hammer"); //NFP
    //log.warn(hammer);
    var style = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(style);
    var sndcnt = document.getElementById('sndcnt');
    var sndbt = document.getElementById('sndbt');
    var nosnd = document.getElementById('nosnd');
    var pts = document.getElementById("pts");
    var pop = document.getElementById("pop");
    var helper = document.getElementById("helper");
    var percentage = document.getElementById("percentage");
    var popups = Array.prototype.slice.call(document.querySelectorAll(".muchopts"));
    function set_sizes(){
        log.warn("Sets sizes");
        document.getElementsByTagName('head')[0].removeChild(style);
        style.type = 'text/css';
        style.innerHTML = 'img { max-height: '+(window.innerHeight)+'px; max-width:'+(window.innerWidth)+'px; overflow:hidden}';
        document.getElementsByTagName('head')[0].appendChild(style);
        txarea.style.height = window.innerHeight+"px";
        txarea.style.width = window.innerWidth+"px";
        helper.style.height = window.innerHeight+"px";
        helper.style.width = window.innerWidth+"px";
        pop.style.width = window.innerWidth+"px";
        pop.style.minWidth = window.innerWidth+"px";
        pts.style.width = window.innerWidth-4+"px";
        pts.style.minWidth = window.innerWidth-4+"px";
        fl_text.style.width =  "auto";
        mtext.style.top = "0px";
        txarea.style.backgroundSize = '100%';
    }
    window.onresize = function(){
            set_sizes();
            log.warn("Call for percent from window.onresize"); //NFP
            fill_page([], options.getpercent(), true);
        };
    var hammerelements = {};
    function chkmv(evt){
        //log.warn(evt.distance+" vs "+drvhds);//NFP
        evt.srcEvent.preventDefault();
        if(drvhds<evt.distance){
            //log.warn(hammerelements);
            //log.warn(evt.target.id);
            for(var key in hammerelements) {
                hammerelements[key].stop();
            }
            return true;
        }
        return false;
    }
    //screen.onmozorientationchange = set_sizes;
    set_sizes();
    var drvhds = parseInt(Math.min(Math.floor(window.innerHeight), Math.floor(window.innerWidth))/3);
    var hmctxarea = new hammer.Manager(txarea, { recognizers: [
            [hammer.Tap], [hammer.Press, { time: 300, threshold: 3 }],
            [hammer.Swipe, { direction: hammer.DIRECTION_ALL } ],
            [hammer.Pan, { direction: hammer.DIRECTION_ALL } ]
    ]});
    log.warn("hmctxarea");
    log.warn(hmctxarea);
    hammerelements[txarea.id] = hmctxarea;
    hmctxarea.add( new hammer.Tap({ event: 'doubletap', taps: 2 }) );
    hmctxarea.add( new hammer.Pinch({ direction: hammer.DIRECTION_ALL }) );
    hmctxarea.add( new hammer.Swipe({ direction: hammer.DIRECTION_ALL }) );
    hmctxarea.add( new hammer.Pan({ direction: hammer.DIRECTION_ALL }) );
    hmctxarea.on("doubletap doubleclick", function(evt){
            log.warn("doubletap detected");//NFP
            options.set_opt('scale', 1.0);
            uitouch.init_scale(1.0);
        });
    hmctxarea.on("panleft swipeleft", function(evt){if(chkmv(evt)){uitouch.liftcol(mtext, -1); pop.style.display='none';}});
    hmctxarea.on("panright swiperight", function(evt){if(chkmv(evt)){uitouch.liftcol(mtext, 1); pop.style.display='none';}});
    hmctxarea.on("panup swipeup", function(evt){if(chkmv(evt)){
            options.display('hide');
            pop.style.display='none';
            popups.map(function(el){el.style.display="none";});
        }});
    hmctxarea.on("pandown swipedown", function(evt){if(chkmv(evt)){options.display('show'); pop.style.display='none';}});
    hmctxarea.on("tap click press", function(evt){
            uitouch.handleClick(evt);
            popups.map(function(el){el.style.display="none";});
            });
    hmctxarea.on("pinchstart", function(evt){
        log.warn("pinchstart");//NFP
        percentage.style.display='block';});
    hmctxarea.on("pinchend", function(evt){
        log.warn("pinchend");//NFP
        percentage.style.display='none';});
    hmctxarea.on("pinchin pinchout", function(evt){
                                               hmctxarea.stop();
                                               var uisc = uitouch.doscale(Math.sqrt(evt.scale));
                                               log.warn("evt.scale is", evt.scale); //NFP
                                               percentage.textContent = Math.round(uisc*100)+"%";
                                               window.setTimeout(function(){percentage.style.display='none';}, 1024);
                                               });
    var hammerpop = new hammer.Manager(pop, {
            recognizers: [
            // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
            [hammer.Pan, { direction: hammer.DIRECTION_ALL } ],
            [hammer.Tap], [hammer.Press, { time: 300, threshold: 3 }]
    ]});
    var hammermtext = new hammer.Manager(mtext, {
            recognizers: [
            [hammer.Tap], [hammer.Press, { time: 300, threshold: 3 }]
    ]});
    hammerelements[pop.id] = hammerpop;
    hammerelements[mtext.id] = hammermtext;
    hammerpop.on("panleft",  function(evt){if(chkmv(evt)){uitouch.liftcol(pts,-1);}});
    hammerpop.on("panright", function(evt){if(chkmv(evt)){uitouch.liftcol(pts, 1);}});
    hammerpop.on("panup pandown",   function(evt){uitouch.dragpop(evt.center.y);});
    //hammerpop.on("press", uitouch.handleClick);
    hammermtext.on("click tap press", function(e){
        popups.map(function(el){el.style.display="none";});
        uitouch.handleClick(e);
    });
    mtext.addEventListener("select", function(e){uitouch.handleSelect(e);}, false);
    var hammerhelper = new hammer(helper);
    hammerhelper.on("click tap pinchin pinchout panleft panright panup pandown", function(evt){
            helper.style.display="none";
        });
    window.addEventListener("keydown", function(e){uitouch.handleKey(e);}, false);
    window.addEventListener("pinch", function(e){log.warn("Pinch supported");}, false);
    //window.addEventListener("", function(e){uitouch.handlegest(e);}, false);
    var opt_bl = document.getElementById("options_block");
    try { window.addEventListener("beforeunload", function(){ log.warn("saving.."); options.savepp();});}
    catch (e) { chrome.app.window.current().onClosed.addListener(function(){log.warn("saving.."); options.savepp();});}
    sharedc.register('uitouch', 'got_selection', function (texts) { thumb_block(uitouch.max_Y(), texts, 'block'); });
    sharedc.register('uitouch', 'next_chapter', function (i) {
            var diff = parseInt(i);
            //mtext.innerHTML='wait..';
            options.display("show");
            book.foliant().next_page(diff);
        });
    sharedc.register('dict', 'got_def', function (txt, word, els) {
        if(txt.length>1) fill_thumb(txt, word, els);
        else fill_thumb("Something went wrong. Please check your options.");
    });
    sharedc.register('bookng', 'got_toc', function(){log.warn("Got toc"); fill_toc(book.get_page(-1)); uitouch.init_scale();});
    sharedc.register('book', 'got_book', function(){log.warn("Got book"); uitouch.init_scale();});
    sharedc.register('options', 'got_file', function(){
            options.remove_old();
            options.display("hide");
            book.init(options.bookfile());
            book.load();
        });
    sharedc.register('bookng', 'got_fstfile', function(data, prc){
        if(data){
            if(prc) { 
                var percent = prc;
            } else {
                log.warn("Call for percent from bookng:got_fstfile"); //NFP
                var percent = options.getpercent();
            }
            log.warn("Fill page with percent "+percent); //NFP
            var sel = document.getElementById("tocselect");
            var newsel = book.foliant().option(sel.selectedIndex);
            fill_page(data, percent, false);
            if(sel.options[newsel]) {
                sel.disabled = true;
                sel.options[newsel].selected = true;
                sel.disabled = false;
            }
            options.display("hide");
        }
    });    
    sharedc.register('options', 'got_pp', function () {
                                                var i = options.getpage();
                                                log.warn("Call for percent from options:got_pp"); //NFP
                                                var prc = options.getpercent();
                                                book.foliant().get_fromopt(i, prc);
                                            });
    sharedc.register('options', 'ch_range', function (value) {
                                            fill_page([0,0], value, false);
                                        });
 
    function fill_toc(html){
        log.warn("Create TOC from ");//NFP
        log.warn(html);//NFP
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
        sel.addEventListener("change", function (event){
                                                if(event.target.disabled === true) {
                                                    event.target.disabled = false;
                                                    log.warn("Dummy fired TOC selection change"); //NFP
                                                } else {
                                                    mtext.style.top="0px";
                                                    options.setpercent(0);
                                                    book.foliant().get_fromopt(event.target.selectedIndex);
                                                    log.warn("Fired TOC selection change"); //NFP
                                                }  
                                       });
        options.getpp();
    }
    function prc_from_anchor(anchor, prc){
        log.warn("Got"); //NFP
        log.warn("anchor "+anchor); //NFP
        log.warn("prc "+prc); //NFP
        var ancel = document.getElementById(anchor);
        if(!ancel) 
            if(!prc) return 0;
            else return prc;
        var antop = parseFloat(stuff.getStyle(ancel, 'top'));
        var cheight = parseFloat(stuff.getStyle(mtext, 'height'));
        return 100.0*antop/cheight;
    }
    function fill_page(data, percent, nosave){
        if(percent<0) percent=0;
        if(data[0]) mtext.innerHTML = data[0];
        mtext.style.width = 'auto';
        mtext.style.height = 'auto';
        mtext.style.display = 'block';
        var fs = parseInt(stuff.getStyle(mtext, 'font-size'));
        var cheight = mtext.scrollHeight;//stuff.getStyle(mtext, 'height');
        if(!nosave) options.setpage(book.foliant().currentpage());
        if(data[1] && !percent) percent = prc_from_anchor(data[1], percent);
        else if(percent==='end') percent = 100.0*parseFloat(cheight-window.innerHeight/2)/cheight;
        mtext.style.top = parseInt(-percent*parseFloat(cheight)/100.0)+"px";
        if(!nosave){
            options.setpercent(percent);
            log.warn("saving..");  options.savepp();
        }
        return mtext;
    }
    function fill_thumb(dtext, word, els){
        log.info("fill_thumb with response for word "+word+" with length "+dtext.length);
        if(dtext.length > 1){
            var cl = document.getElementById('pts');
            var el = document.getElementById('pop');
            cl.innerHTML = '';
            var cf = 0.1;
            log.info("el.style.width = "+el.style.width);
            if(els && els.length){
                function on_el_click(evt) {
                    const y = cl.getBoundingClientRect().y;
                    thumb_block(y, evt.target.textContent, 'block');
                }
                for(var i = 0; i<els.length; i++){
                    cl.appendChild(document.createElement("br"));
                    els[i].addEventListener('click', on_el_click, false); 
                    cl.appendChild(els[i]);
                }
            }
            try {
                log.info("Set inner HTML to this:\n"+dtext+"\n");
                var resp_holder = document.createElement("div");
                resp_holder.innerHTML = dtext;
                cl.appendChild(resp_holder);
            } catch (e) {
                log.error("Can't set innerHTML to provided response, got error "+e);
                cl.innerHTML = "Error happen while setting innerHTML, see logs for details";
            }
            sndbt.appendChild(sndcnt);
            cl.appendChild(sndbt);
            cl.appendChild(nosnd);
            el.style.display = 'block';
            sndbt.style.display = 'block';
            uitouch.dragpop(-1);
            sndbt.style.display = 'none';
            sound.get_sound(word, dict.lang());
        } else {el.style.display = 'none';}
    }
    function thumb_block(mY, texts, disp) {
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        cl.innerHTML = "Sending request..";
        log.warn("Got texts:");//NFP
        log.warn(texts);//NFP
        var pos = 0;
        if(el){
            if(disp!='none'){
                var config = options.config();
                var ptop = parseInt(txarea.style.height);
                if(mY < ptop/2) pos = 'bot';
                else pos = 'top';
                cl.style.top = "0px";
                if(pos==='top'){
                      el.style.top = 0+"px"; el.style.bottom = '100%';
                    }
                if(pos==='bot'){el.style.bottom = 0+"px"; el.style.top = '100%';}// dt.style.display='none'; db.style.display=disp;}
                dict.get_def(texts);
            } else {el.style.display = disp;}
        }
    }
});
