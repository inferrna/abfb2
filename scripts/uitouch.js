define(
    ['options'],
  function(options){
      var moveflag = 0;
      var timer = null;
      var sxG = 0;
      var syG = 0;
      function sign(x) { return x && x / Math.abs(x); }
      function handleTouch(evt) {
          var touches = evt.changedTouches;
          var x = touches[touches.length-1].clientX;
          var y = touches[touches.length-1].clientY;
          var dx = x - sxG;
          var dy = y - syG;
          if(Math.abs(dx)>64){ 
              liftcol(evt.target, sign(dx));
              sxG = x; syG = y;
              window.clearTimeout(timer);
              moveflag = 0;
              console.log(evt);
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
          var el_rectObject = el.getBoundingClientRect();
          //ptop = Math.max(parseInt(el.parentNode.parentNode.style.top), parseInt(el.parentNode.parentNode.style.bottom));
          ptop = el.parentNode.parentNode.offsetHeight;
          console.log(top,"-",ptop);
          top = top+dir*(ptop-12);
          if(top>0) top = 0;
          else if( top<(-el_rectObject.height) ){
              console.log("el_rectObject.height==", el_rectObject.height, "; top==", top);
              top = -(el_rectObject.height - 64);
          }
          el.style.top = top+"px";
      }
      function movesbot(touches, el){
          var newpos = 0;
          var oldpos = el.style.bottom;
          for (var i=0; i<touches.length; i++) {
              //ongoingTouches.push(touches[i]);
              newpos = window.innerHeight - touches[i].clientY;
              el.style.bottom = newpos+'px';
              console.log("Move to "+newpos+". Oldpos was "+oldpos);
          }
      }
      function movestop(touches, el){
          var newpos = 0;
          var oldpos = el.style.bottom;
          for (var i=0; i<touches.length; i++) {
              //ongoingTouches.push(touches[i]);
              newpos = touches[i].clientY;
              el.style.top = newpos+'px';
              console.log("Move to "+newpos+". Oldpos was "+oldpos);
          }
      }
      return {
          handleTouchstart:function (evt) {
              console.log("Touch start", moveflag, syG, sxG);
              syG = evt.changedTouches[0].clientY;
              sxG = evt.changedTouches[0].clientX;
              timer = window.setTimeout(function(){moveflag=1}, 1024);
              evt.preventDefault();
              handleTouch(evt);
          },
          handleTouchend:function (evt) {
              console.log("Touch end", moveflag, syG, sxG);
              window.clearTimeout(timer);
              handleTouch(evt);
              moveflag=0;
          },
          handleTouch:function (evt){
              handleTouch(evt);
          }
      }
  }
);
