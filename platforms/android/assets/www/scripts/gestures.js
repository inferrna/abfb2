define([],
function(){
    var ispinch = false;
    var timer = null;
    var distG = 1.0;
    var cf = 1.0;
    function get_dist(x1, y1, x0, y0){
        var dy = (y1-y0);///window.innerHeight;
        var dx = (x1-x0);///window.innerWidth;
        return Math.sqrt(dx*dx + dy*dy);
    }
    function dopinch(evt){
        var touchlists = evt.changedTouches;
        //console.log(touchlists.length+" touches, doing pinch.");
        var x1 = touchlists[touchlists.length-1].clientX;
        var y1 = touchlists[touchlists.length-1].clientY;
        var x0 = touchlists[0].clientX;
        var y0 = touchlists[0].clientY;
        var dist = get_dist(x1, y1, x0, y0);
        if(isNaN(dist)){ console.warn("dist == NaN. touches is "+x1+", "+y1+", "+x0+", "+y0); return; }
        if(ispinch===false){
            cf = 1.0;
            distG = dist;
            distG = distG < 0.1 ? 0.1 : distG;
            //console.log("setpinch olddist=="+dist+" newdist=="+distG);
        } else {
            //cf = 1.25+0.5*Math.atan(dist-distG);
            cf = Math.sqrt(dist/distG);
            //console.log("olddist=="+distG+" newdist=="+dist+" cf=="+cf);
        }
    }
    return {
        ispinch:function(evt){
            if(evt.changedTouches.length<2) {
                //console.log("Set timer");
                window.clearTimeout(timer);
                timer = window.setTimeout(function(){ispinch=false; cf = 1.0;}, 512);
            } else {
                if(timer){ window.clearTimeout(timer); timer = 0; }
                dopinch(evt);
                ispinch = true;
            }
            return ispinch;
        },
        coeff:function(){
            return(cf);
        },
        pinch: function(){ return ispinch; },
        clear:function(){
            //console.log("Got clear");
            ispinch = false;
            window.clearTimeout(timer);
            cf = 1.0;
        }
    }   
});
