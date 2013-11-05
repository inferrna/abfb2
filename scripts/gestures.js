define([],
function(){
    var ispinch = false;
    var timer = null;
    var distG = 1;
    var cf = 1.0;
    function get_dist(x1, y1, x0, y0){
        return Math.sqrt(Math.abs(x1-x0)^2 + Math.abs(y1-y0)^2);
    }
    function dopinch(evt){
        var touchlists = evt.changedTouches;
        console.log(touchlists.length+" touches, doing pinch.");
        var x1 = touchlists[touchlists.length-1].clientX;
        var y1 = touchlists[touchlists.length-1].clientY;
        var x0 = touchlists[0].clientX;
        var y0 = touchlists[0].clientY;
        var dist = get_dist(x1, y1, x0, y0);
        if(ispinch===false){
            cf = 1.0;
            distG = dist;
            distG = distG < 8 ? 8 : distG;
        } else {
            cf = (1.0*dist)/distG;
            distG = dist;
        }
    }
    return {
        ispinch:function(evt){
            if(evt.changedTouches.length<2) {
                timer = window.setTimeout(function(){ispinch=false; cf = 1.0;}, 512);
            } else {
                window.clearTimeout(timer);
                dopinch(evt);
                ispinch = true;
            }
            return ispinch;
        },
        coeff:function(){
            return(cf);
        },
        clear:function(){
            ispinch = false;
            window.clearTimeout(timer);
            cf = 1.0;
        }
    }   
});
