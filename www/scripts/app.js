require(['uitouch', 'dict', 'options', 'book', 'stuff', 'sharedf', 'sharedc', 'require'],
function(uitouch, dict, options, book, stuff, sharedf, sharedc, require){
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
    var style = document.createElement('style');
    hammer = Hammer;
    document.getElementsByTagName('head')[0].appendChild(style);
    var pts = document.getElementById("pts");
    var pop = document.getElementById("pop");
    var percentage = document.getElementById("percentage");
    function set_sizes(){
        console.log("Sets sizes");
        document.getElementsByTagName('head')[0].removeChild(style);
        style.type = 'text/css';
        style.innerHTML = 'img { max-height: '+(window.innerHeight)+'px; max-width:'+(window.innerWidth)+'px; overflow:hidden}';
        document.getElementsByTagName('head')[0].appendChild(style);
        txarea.style.height = window.innerHeight+"px";
        txarea.style.width = window.innerWidth+"px";
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
    var hmctxarea = new hammer.Manager(txarea, {});/*
            recognizers: [
            // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
            [hammer.Pan, { direction: hammer.DIRECTION_ALL}  ],
            [hammer.Pinch],
            [hammer.Tap],
            [hammer.Swipe,{ direction: hammer.DIRECTION_ALL }]
        ]} );*/
    console.log("hmctxarea");
    console.log(hmctxarea);
    //hmctxarea.get('pan').set({ direction: hammer.DIRECTION_ALL });
    //hmctxarea.get('swipe').set({ direction: hammer.DIRECTION_ALL });
    hammerelements[txarea.id] = hmctxarea;
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
        }});
    hmctxarea.on("pandown swipedown", function(evt){if(chkmv(evt)){options.display('show'); pop.style.display='none';}});
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
    var hammerpop = new hammer.Manager(pop, {
            recognizers: [
            // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
            [hammer.Pan, { direction: hammer.DIRECTION_ALL } ],
            [hammer.Tap]
    ]});
    var hammermtext = new hammer.Manager(mtext, {
            recognizers: [
            [hammer.Tap]
    ]});
    hammerelements[pop.id] = hammerpop;
    hammerelements[mtext.id] = hammermtext;
    hammerpop.on("panleft",  function(evt){if(chkmv(evt)){uitouch.liftcol(pts,-1);}});
    hammerpop.on("panright", function(evt){if(chkmv(evt)){uitouch.liftcol(pts, 1);}});
    hammerpop.on("panup pandown",   function(evt){uitouch.dragpop(evt.center.y);});
    hammermtext.on("click tap", function(e){
            uitouch.handleClick(e);});
    mtext.addEventListener("select", function(e){uitouch.handleSelect(e);}, false);
    window.addEventListener("keydown", function(e){uitouch.handleKey(e);}, false);
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
    function prc_from_anchor(anchor, prc){
        console.log("Got"); //NFP
        console.log("anchor "+anchor); //NFP
        console.log("prc "+prc); //NFP
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
            el.style.display = 'block';
            if(els && els.length){
                for(var i = 0; i<els.length; i++){
                    cl.appendChild(document.createElement("br"));
                    cl.appendChild(els[i]);
                }
            }
            uitouch.dragpop(-1);
        } else {el.style.display = 'none';}
    }
    function thumb_block(mY, texts, disp) {
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        cl.innerHTML = "Sending request..";
        console.log("Got texts:");//NFP
        console.log(texts);//NFP
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
