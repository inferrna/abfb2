require(['uitouch', 'dict', 'options', 'book', 'stuff', 'sound', 'sharedf', 'sharedc', 'require', 'advanced', 'frame', 'hammer'],
function(uitouch, dict, options, book, stuff, sound, sharedf, sharedc, require, advanced, frame){
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
    var mtextfrm = document.getElementById('mainframe');
    var fl_text = document.getElementById('fl_text');
    var ta_rectObject = txarea.getBoundingClientRect();
    var hammer = require('hammer');
    console.log("Got hammer"); //NFP
    console.log(hammer);
    var style = mtextfrm.ownerDocument.createElement('style');
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
        frame.set_sizes();
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
            console.log("Call for percent from window.onresize"); //NFP
            fill_page([], options.getpercent(), true);
        };
    var hammerelements = {};
    function chkmv(evt){
        console.log(evt.distance+" vs "+drvhds);//NFP
        evt.srcEvent.preventDefault();
        if(drvhds<evt.distance){
            //console.log(hammerelements);
            //console.log(evt.target.id);
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
    function eventifymtext(ifrm){
        if(hammerelements[ifrm.id]) delete hammerelements[ifrm.id];
        var hmctxarea = new hammer.Manager(ifrm, { recognizers: [
                [hammer.Tap], [hammer.Press, { time: 300, threshold: 3 }],
                [hammer.Swipe, { direction: hammer.DIRECTION_ALL } ],
                [hammer.Pan, { direction: hammer.DIRECTION_ALL } ]
        ]});
        console.log("hmctxarea");//NFP
        console.log(hmctxarea);//NFP
        hammerelements[ifrm.id] = hmctxarea;
        hmctxarea.add( new hammer.Tap({ event: 'doubletap', taps: 2 }) );
        hmctxarea.add( new hammer.Pinch({ direction: hammer.DIRECTION_ALL }) );
        hmctxarea.add( new hammer.Swipe({ direction: hammer.DIRECTION_ALL }) );
        hmctxarea.add( new hammer.Pan({ direction: hammer.DIRECTION_ALL }) );
        hmctxarea.on("doubletap doubleclick", function(evt){
                console.log("doubletap detected");//NFP
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
            console.log("pinchstart");//NFP
            percentage.style.display='block';});
        hmctxarea.on("pinchend", function(evt){
            console.log("pinchend");//NFP
            percentage.style.display='none';});
        hmctxarea.on("pinchin pinchout", function(evt){
                                                   hmctxarea.stop();
                                                   var uisc = uitouch.doscale(Math.sqrt(evt.scale));
                                                   console.log("evt.scale is", evt.scale); //NFP
                                                   percentage.textContent = Math.round(uisc*100)+"%";
                                                   window.setTimeout(function(){percentage.style.display='none';}, 1024);
                                                   });
    }
    eventifymtext(mtextfrm);
    var hammerpop = new hammer.Manager(pop, {
            recognizers: [
            // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
            [hammer.Pan, { direction: hammer.DIRECTION_ALL } ],
            [hammer.Tap]
    ]});
    var hammermtext = new hammer.Manager(mtext, {
            recognizers: [
            [hammer.Tap], [hammer.Press, { time: 300, threshold: 3 }]
    ]});
    var hmcfltext = new hammer.Manager(fl_text, { recognizers: [
            [hammer.Swipe, { direction: hammer.DIRECTION_ALL } ],
            [hammer.Pan, { direction: hammer.DIRECTION_ALL } ]
    ]});
    hammerelements[fl_text.id] = hmcfltext;
    hmcfltext.add( new hammer.Swipe({ direction: hammer.DIRECTION_ALL }) );
    hmcfltext.add( new hammer.Pan({ direction: hammer.DIRECTION_ALL }) );
    hmcfltext.on("panleft swipeleft", function(evt){if(chkmv(evt)){uitouch.liftcol(mtext, -1); pop.style.display='none';}});
    hmcfltext.on("panright swiperight", function(evt){if(chkmv(evt)){uitouch.liftcol(mtext, 1); pop.style.display='none';}});
    hmcfltext.on("panup swipeup", function(evt){if(chkmv(evt)){
            options.display('hide');
            pop.style.display='none';
            popups.map(function(el){el.style.display="none";});
        }});
    hmcfltext.on("pandown swipedown", function(evt){if(chkmv(evt)){options.display('show'); pop.style.display='none';}});
    hammerelements[pop.id] = hammerpop;
    hammerelements[mtext.id] = hammermtext;
    hammerpop.on("panleft",  function(evt){if(chkmv(evt)){uitouch.liftcol(pts,-1);}});
    hammerpop.on("panright", function(evt){if(chkmv(evt)){uitouch.liftcol(pts, 1);}});
    hammerpop.on("panup pandown",   function(evt){uitouch.dragpop(evt.center.y);});
    hammermtext.on("click tap press", function(e){
            popups.map(function(el){el.style.display="none";});
            uitouch.handleClick(e);
            });
    mtextfrm.contentDocument.body.addEventListener("select", function(e){uitouch.handleSelect(e);}, false);
    var hammerhelper = new hammer(helper);
    hammerhelper.on("click tap pinchin pinchout panleft panright panup pandown", function(evt){
            helper.style.display="none";
        });
    window.addEventListener("keydown", function(e){uitouch.handleKey(e);}, false);
    mtextfrm.contentDocument.body.addEventListener("keydown", function(e){uitouch.handleKey(e);}, false);
    window.addEventListener("pinch", function(e){console.log("Pinch supported");}, false);
    //window.addEventListener("", function(e){uitouch.handlegest(e);}, false);
    var opt_bl = document.getElementById("options_block");
    try { window.addEventListener("beforeunload", function(){ console.log("saving.."); options.savepp();});}
    catch (e) { chrome.app.window.current().onClosed.addListener(function(){console.log("saving.."); options.savepp();});}
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
    sharedc.register('bookng', 'got_toc', function(){console.log("Got toc"); fill_toc(book.get_page(-1)); uitouch.init_scale();});
    sharedc.register('book', 'got_book', function(){console.log("Got book"); uitouch.init_scale();});
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
                console.log("Call for percent from bookng:got_fstfile"); //NFP
                var percent = options.getpercent();
            }
            console.log("Fill page with percent "+percent); //NFP
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
                                                console.log("Call for percent from options:got_pp"); //NFP
                                                var prc = options.getpercent();
                                                book.foliant().get_fromopt(i, prc);
                                            });
    sharedc.register('options', 'ch_range', function (value) {
                                            fill_page([0,0], value, false);
                                        });
 
    function fill_toc(html){
        console.log("Create TOC from ");//NFP
        console.log(html);//NFP
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
                                                    console.log("Dummy fired TOC selection change"); //NFP
                                                } else {
                                                    mtext.style.top="0px";
                                                    options.setpercent(0);
                                                    book.foliant().get_fromopt(event.target.selectedIndex);
                                                    console.log("Fired TOC selection change"); //NFP
                                                }  
                                       });
        options.getpp();
    }
    function fill_page(data, percent, nosave){
        if(percent<0) percent=0;
        if(data[0]){
            mtextfrm.contentDocument.open();
            mtextfrm.contentDocument.close();
            mtextfrm.contentDocument.write(data[0]);
            sharedf.move_tags(mtextfrm.contentDocument.getElementsByTagName("body")[0],
                              ['style'],
                              mtextfrm.contentDocument.getElementsByTagName("head")[0]);
            frame.set_fontcolor();
            frame.set_sizes();
            frame.set_fontsize();
        }
        var cheight = parseInt(stuff.getStyle(mtextfrm.contentWindow.document.body.parentNode, 'height'));
        cheight = Math.max(cheight, window.innerHeight);
        mtextfrm.style.width = window.innerWidth+'px';
        mtextfrm.style.height = cheight+'px';
        mtext.style.height = cheight+'px';
        mtextfrm.style.display = 'block';
        eventifymtext(mtextfrm.contentWindow.document.body.parentNode);
        var fs = parseInt(stuff.getStyle(mtext, 'font-size'));
        if(!nosave) options.setpage(book.foliant().currentpage());
        if(data[1] && !percent) percent = frame.prc_from_anchor(data[1], percent);
        else if(percent==='end') percent = 100.0*parseFloat(cheight-window.innerHeight/2)/cheight;
        mtext.style.top = parseInt(-percent*parseFloat(cheight)/100.0)+"px";
        if(!nosave){
            options.setpercent(percent);
            console.log("saving..");  options.savepp();
        }
        return mtext;
    }
    function fill_thumb(text, word, els){
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
            sound.get_sound(word, dict.lang());
        } else {el.style.display = 'none';}
    }
    function thumb_block(mY, texts, disp) {
        mY = mY + parseInt(mtext.style.top || 0); //Compensate vertical shift
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        cl.innerHTML = "Sending request..";
        console.log("Got texts:");//NFP
        console.log(texts);//NFP
        var pos = 0;
        if(el){
            if(disp!='none'){
                var config = options.config();
                var ptop = window.innerHeight;
                console.log("my, mtop=="+mY+", "+mtext.style.top);//NFP
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
