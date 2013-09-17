define(
    ['options'],
  function(options){
      var moveflag = 0;
      var hold = 0;
      var timer = null;
      var sxG = 0;
      var syG = 0;
      function sign(x) { return x && x / Math.abs(x); }
      function handleTouch(evt, start) {
          var type = evt.type.substring(0,5);
          var touches = [];
          var touchlists = evt.changedTouches;
          //console.log(type);
          if(type==="touch"){
            for(var t=0; t<touchlists.length; t++){
                //console.log("t",t);
                touches.push({"clientX":touchlists[t].clientX, "clientY":touchlists[t].clientY});
            }
          } else if(type==="wheel") {
            ///console.log(evt.type, moveflag);
            //if(hold===1) 
                touches = [{"clientX":evt.clientX+evt.deltaX, "clientY":evt.clientY+evt.deltaY}];
            //else return;
          } else {
            console.log("Probably bad event:", evt, type);
            return
          }
          if(start===1){
              syG = touches[0]["clientY"];
              sxG = touches[0]["clientX"];
          }
          var x = touches[touches.length-1]["clientX"];
          var y = touches[touches.length-1]["clientY"];
          var dx = x - sxG;
          var dy = y - syG;
          //console.log(dx, dy, x, y, sxG, syG, touches);
          if(Math.abs(dx)>64){ 
              liftcol(evt.target, sign(dx));
              sxG = x; syG = y;
              window.clearTimeout(timer);
              moveflag = 0;
              //console.log(evt);
              return;
          } else if (dy>64){
              options.display('block');
              console.log("Show opts");
          } else if (dy<-64){
              options.display('none');
              console.log("Hide opts");
          } else if(moveflag==1) {
              sxG = x;
              syG = y;
              console.log("dy==", dy);
              console.log("Touch proceed");
              evt.preventDefault();
              var el = document.getElementById('pop');//evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
              console.log(evt.target.id);
              //if(evt.target.id==='drugtop') 
              if(el.style.top === '0px') movesbot(touches, el);
              else if(el.style.bottom === '0px') movestop(touches, el);
              else console.log("No action.", el.style.bottom, el.style.top);
          }
          //else if(evt.target.id==='drugbot') 
              //movestop(touches, el);
      }
     function liftcol(el, dir) {
          //var el = document.getElementById(elnm);
          var top = parseInt(el.style.top);
          var ptop;
          var el_rectObject = el.parentNode.getBoundingClientRect();
          //ptop = Math.max(parseInt(el.parentNode.parentNode.style.top), parseInt(el.parentNode.parentNode.style.bottom));
          ptop = el.parentNode.parentNode.offsetHeight;
          top = top+dir*(ptop-12);
          console.log(top, ptop, ", el_rectObject.height==", el_rectObject.height);
          if(top>0) top = 0;
          else if( top<(-el_rectObject.height) ){
              console.log("el_rectObject.height==", el_rectObject.height, "; top==", top);
              top = -(el_rectObject.height - ptop/2);
          }
          el.style.top = top+"px";
          console.log("el.style.top==", el.style.top);
      }
      function movesbot(touches, el){
          var newpos = 0;
          var oldpos = el.style.bottom;
          for (var i=0; i<touches.length; i++) {
              //ongoingTouches.push(touches[i]);
              newpos = window.innerHeight - touches[i]["clientY"];
              el.style.bottom = newpos+'px';
              console.log("Move to "+newpos+". Oldpos was "+oldpos);
          }
      }
      function movestop(touches, el){
          var newpos = 0;
          var oldpos = el.style.bottom;
          for (var i=0; i<touches.length; i++) {
              //ongoingTouches.push(touches[i]);
              newpos = touches[i]["clientY"];
              el.style.top = newpos+'px';
              console.log("Move to "+newpos+". Oldpos was "+oldpos);
          }
      }
      return {
          handleTouchstart:function (evt) {
              console.log("Touch start", moveflag, syG, sxG);
              timer = window.setTimeout(function(){moveflag=1}, 1024);
              evt.preventDefault();
              handleTouch(evt, 1);
          },
          handleTouchend:function (evt) {
              console.log("Touch end", moveflag, syG, sxG);
              window.clearTimeout(timer);
              handleTouch(evt, 0);
              moveflag=0;
          },
          handleTouch:function (evt){
              handleTouch(evt, 0);
          },
          handleclick:function(evt){
              if(hold === 0) hold=1;
              else hold = 0;
              console.log("click makes hold", hold);
          }
      }
  }
);
