require(['uitouch', 'dict'], function(uitouch, dict){
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
    //document.getElementById('button_1').onclick=function(){uitouch.liftcol('pts', -1)};
   // document.getElementById('button_2').onclick=function(){uitouch.liftcol('pts', 1)};
    document.getElementById('ptop').onclick=function(){thumb_block('top', 'block'); return false;};
    document.getElementById('pbot').onclick=function(){thumb_block('bot', 'block'); return false;};
    var txarea = document.getElementById('txtarea');
    var ta_rectObject = txarea.getBoundingClientRect();
    //console.log("txarea.style.offsetHeight==", ta_rectObject.height, "; txarea.style.offsetTop==", ta_rectObject.top);
    txarea.style.height = (window.innerHeight - ta_rectObject.top - 1)+"px";
      /*dreq = new XMLHttpRequest();
      dreq.onload = function (event) {fill_thumb(event.target.responseText);}
      try {myws_connect('ws://192.168.0.2:2680');}
      catch(e) {console.log(e);}
      try {var socket = navigator.mozTCPSocket.open('localhost', '2628');}
      catch(e) {console.log("GotError:", e);}*/
      var dt = document.getElementById("pop");
      dt.addEventListener("touchstart", uitouch.handleTouchstart, false);
      dt.addEventListener("touchend", uitouch.handleTouchend, false);
      dt.addEventListener("touchmove", uitouch.handleTouch, false);
      var marea = document.getElementById("maintext");
      marea.style.top = "0px";
      marea.addEventListener("touchstart", uitouch.handleTouchstart, false);
      marea.addEventListener("touchend", uitouch.handleTouchend, false);
      marea.addEventListener("touchmove", uitouch.handleTouch, false);
    function fill_thumb(text){
        var cl = document.getElementById('pts');
        var el = document.getElementById('pop');
        var cf = 0.1;
        var width = parseInt(el.style.width, 10);
        dtext = text.replace(reb, "strong>").replace(retr, "/").replace(ren, "<br>");
        cl.innerHTML = dtext;
        /*cf = 2.0/(parseFloat(window.innerHeight)/parseFloat(cl.clientHeight));
        width = parseInt(cf*width/100.0)*100+100;
        el.style.width = width+"%";*/
        console.log(cl.clientWidth, "/", cl.clientHeight, cf, width);
    }
    function thumb_block(pos, disp) {
        var el = document.getElementById('pop');
        var cl = document.getElementById('pts');
        //var dt = document.getElementById('drugtop');
        //var db = document.getElementById('drugbot');
        if(el){
            //el.style.height = '15%';
            if(disp!='none'){
                cl.style.top = "0px";
                /*el.style.width = "6000%";
                el.style.left = "0%";
                cl.style.width = "auto";
                var clw = (window.innerWidth-8)+"px";
                cl.style.webkitColumns = clw;
                cl.style.MozColumns = clw;
                cl.style.columns = clw;*/
                if(pos==='top'){el.style.top = 0; el.style.bottom = '85%';}// db.style.display='none'; dt.style.display=disp;}
                if(pos==='bot'){el.style.bottom = 0; el.style.top = '85%';}// dt.style.display='none'; db.style.display=disp;}
                try {ws.send(window.btoa("DEFINE ! value"+"\n"));}
                catch(e) {
                    //var xurl = "http://192.168.0.2:8082/?word="+"value"+"&dict="+"!"+"&host="+"localhost"+"&port="+"2628";
                    //console.log(xurl);
                    dict.init_params({text: "value"});
                    dict.dreq.addEventListener('got_def', function (e) { fill_thumb(dict.response()); }, false);
                    //dict.dreq.open("GET", xurl, true);
                    //dict.dreq.send();
                    dict.get_def("display");
                    //console.log("Got response ", dict.response());
                }
            }
            el.style.display = disp;
        }
    }
});
