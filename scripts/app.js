require(['uitouch', 'dict', 'options'], function(uitouch, dict, options){
    console.log("app.js loads");
    var ongoingTouches = new Array;
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
    var ta_rectObject = txarea.getBoundingClientRect();
    txarea.style.height = (window.innerHeight - ta_rectObject.top - 1)+"px";
    var dt = document.getElementById("pop");
    dt.addEventListener("touchstart", uitouch.handleTouchstart, false);
    dt.addEventListener("touchend", uitouch.handleTouchend, false);
    dt.addEventListener("touchmove", uitouch.handleTouch, false);
    var marea = document.getElementById("maintext");
    marea.style.top = "0px";
    marea.addEventListener("touchstart", uitouch.handleTouchstart, false);
    marea.addEventListener("touchend", uitouch.handleTouchend, false);
    marea.addEventListener("touchmove", uitouch.handleTouch, false);
    document.addEventListener('got_selection', function (e) { thumb_block(uitouch.max_Y(), uitouch.selected_word(), 'block'); }, false);
    function fill_thumb(text){
        var cl = document.getElementById('pts');
        var el = document.getElementById('pop');
        var cf = 0.1;
        var width = parseInt(el.style.width, 10);
        dtext = text.replace(reb, "strong>").replace(retr, "/").replace(ren, "<br>");
        cl.innerHTML = dtext;
    }
    function thumb_block(mY, word, disp) {
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        var pos = 0;
        if(el){
            if(disp!='none'){
                var config = options.config();
                console.log("Got config", config);
                ptop = parseInt(txarea.style.height);//marea.parentNode.parentNode.offsetHeight;
                console.log("mY vs ptop", mY, ptop);
                if(mY < ptop/2) pos = 'bot';
                else pos = 'top';
                cl.style.top = "0px";
                if(pos==='top'){el.style.top = 0; el.style.bottom = '85%';}// db.style.display='none'; dt.style.display=disp;}
                if(pos==='bot'){el.style.bottom = 0; el.style.top = '85%';}// dt.style.display='none'; db.style.display=disp;}
                    dict.init_params({"text": "value", "dictionary": config["dict_src"], "host": config["socket_host"], "port": parseInt(config["socket_port"])});
                    dict.dreq.addEventListener('got_def', function (e) { fill_thumb(dict.response()); }, false);
                    dict.get_def(word);
            }
            el.style.display = disp;
        }
    }
});
