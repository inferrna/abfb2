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
    txarea.style.width =   window.innerWidth+"px";
    //fl_text.style.height = window.innerHeight+"px";
    fl_text.style.width =  window.innerWidth+"px";
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = 'img { max-height: '+parseInt(window.innerHeight)+'px; max-width:'+parseInt(window.innerWidth)+'px;}';
    document.getElementsByTagName('head')[0].appendChild(style);
    var dt = document.getElementById("pop");
    dt.addEventListener("touchstart", uitouch.handleTouchstart, false);
    dt.addEventListener("touchend", uitouch.handleTouchend, false);
    dt.addEventListener("touchmove", uitouch.handleTouch, false);
    var marea = document.getElementById("maintext");
    marea.style.top = "0px";
    txarea.addEventListener("touchstart", uitouch.handleTouchstart, false);
    txarea.addEventListener("touchend", uitouch.handleTouchend, false);
    txarea.addEventListener("touchmove", uitouch.handleTouch, false);
    uitouch.evo.addEventListener('got_selection', function (e) { thumb_block(uitouch.max_Y(), uitouch.selected_word(), 'block'); }, false);
    uitouch.evo.addEventListener('next_chapter', function (event) {
            var sel = document.getElementById("tocselect");
            var idx = sel.selectedIndex;
            sel.options[idx].selected = null;
            idx+=parseInt(event.target.id);
            if(idx<sel.options.length && idx>-1){
                sel.options[idx].selected = true;
                console.log('next_chapter='+idx);
                fill_page(book.get_page((sel.options[idx].id-1)||idx));
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
        sel.addEventListener("change", function (event){console.log("Select changed"); marea.style.top="0px"; fill_page(book.get_page((event.target.options[event.target.selectedIndex].id-1)||event.target.selectedIndex));} );
        fill_page(book.get_page(0));
    }
    function fill_page(html){
        console.log("Try load html");
        marea.innerHTML = html;
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
