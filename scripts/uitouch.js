define(
    ['options', 'stuff'],
  function(options, stuff){
      var moveflag = 0;
      var liftflag = 0;
      var hold = 0;
      var timer = null;
      var sxG = 0;
      var syG = 0;
      var max_Y = 0;
      var selected_word = '';
      var evo = document.createElement("br");
      var got_sel_ev = new Event('got_selection');
      var pts = document.getElementById('pts');
      var mtext = document.getElementById('maintext');
      var next_ch_ev = new Event('next_chapter');
      function sign(x) { return x && x / Math.abs(x); }
      function handleTouch(evt, start) {
          var type = evt.type.substring(0,5);
          var touches = [];
          var touchlists = evt.changedTouches;
          //console.log(type);
          if(type==="touch"){
            for(var t=0; t<touchlists.length; t++){
                touches.push({"clientX":touchlists[t].clientX, "clientY":touchlists[t].clientY});
            }
          } else if(type==="wheel") {
            ///console.log(evt.type+" "+moveflag);
            //if(hold===1) 
                touches = [{"clientX":evt.clientX+evt.deltaX, "clientY":evt.clientY+evt.deltaY}];
            //else return;
          } else {
            console.log("Probably bad event: "+evt+" "+type);
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
          //console.log(dx, dy, x, y, sxG, syG);
          if(Math.abs(dx)>64){
              evt.preventDefault();
              if(liftflag===1){
                  if(!evt.target.id.match(/pts|pt|pop/)){
                      console.log("Lift mtext, target is "+evt.target);
                      liftcol(mtext, sign(dx));
                  } else{liftcol(pts, sign(dx));}
                  liftflag = 0;
              }
              sxG = x; syG = y;
              window.clearTimeout(timer);
              moveflag = 0;
              //console.log(evt);
              return;
          } else if (dy>64){
              evt.preventDefault();
              options.display('block');
              console.log("Show opts");
          } else if (dy<-64){
              evt.preventDefault();
              options.display('none');
              document.getElementById('pop').style.display = 'none';
              console.log("Hide opts");
          } else if(moveflag===1) {
              evt.preventDefault();
              console.log("flag == "+moveflag);
              if(!evt.target.id.match(/pts|pt|pop/)){
                  var touch = touches[0];//touches.length-1];
                  /*var win = chrome.app.window.current();
                  var winc = win.contentWindow;//.Document()
                  var doc = winc.Document();*/
                  if(document.caretPositionFromPoint) {
                      var cp = document.caretPositionFromPoint(touch["clientX"], touch["clientY"]);
                      var soffset = cp.offset;
                      var target = cp.offsetNode;
                  } else if(document.caretRangeFromPoint) {
                      var cp = document.caretRangeFromPoint(touch["clientX"], touch["clientY"]);
                      var soffset = cp.startOffset;
                      var target = cp.startContainer;
                  } else {console.log("No of both document.caretRangeFromPoint or document.caretPositionFromPoint supports.");}
                  //soffset = caret.offset|caret.startOffset;
                  max_Y = touch["clientY"];
                  selectword(soffset, target);
              } else {
                  sxG = x;
                  syG = y;
                  console.log("dy== "+dy);
                  console.log("Touch proceed");
                  evt.preventDefault();
                  var el = document.getElementById('pop');//evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
                  console.log("Target is "+evt.target.id);
                  //if(evt.target.id==='drugtop') 
                  if(el.style.top === '0px') movesbot(touches, el);
                  else if(el.style.bottom === '0px') movestop(touches, el);
                  else console.log("No action. "+el.style.bottom+" x "+el.style.top);
              }
          }
          //else if(evt.target.id==='drugbot') 
              //movestop(touches, el);
      }
     function liftcol(el, dir) {
          //console.log(el);
          var ptop, top;
          var par_rectO = el.parentNode.getBoundingClientRect();
          var el_rectO = el.getBoundingClientRect();
          var elcstyle = el.currentStyle || window.getComputedStyle(el, null);
          if(el.style.top==='' || el.style.top==='undefined' || el.style.top===null) top = 0;
          else top = parseInt(el.style.top);
          ptop = parseInt(el.parentNode.parentNode.offsetHeight);
          if( el.id==="maintext" && top<(-(el_rectO.height-ptop/2)) ){
              el.style.top="0px";//-(el_rectO.height-ptop)+"px";
              evo.id = "1";
              evo.dispatchEvent(next_ch_ev);
              return;
          }
          //console.log(top, ptop, ", el_rectO.height==", el_rectO.height);
          //console.log("elcstyle.top=="+elcstyle.top+" el.style.top=="+el.style.top+" top=="+top+" ptop=="+ptop);
          top = top+dir*(ptop-8);
          if(top>0){
              if(el.id==="maintext"){
                  evo.id = "-1";
                  el.style.top = "0px";
                  evo.dispatchEvent(next_ch_ev);
                  //el.style.bottom="0px";
                  return;
              } else { top = 0; }
          }
          else if( top<(-(el_rectO.height-24)) ){
              //console.log("el_rectO.height==", el_rectO.height, "; top==", top);
              top = -(el_rectO.height - ptop/4);
          }
          el.style.top = top+"px";
          //console.log("el.style.top==", el.style.top);
      }
      function movesbot(touches, el){
          var newpos = 0;
          var my = max_Y-12;
          var oldpos = parseInt(el.style.bottom);
          for (var i=0; i<touches.length; i++) {
              //ongoingTouches.push(touches[i]);
              newpos = touches[i]["clientY"] < my ? window.innerHeight - touches[i]["clientY"] : window.innerHeight - my;
              if(newpos < parseInt(window.innerHeight) - 24) el.style.bottom = newpos+'px';
              else el.style.display = 'none';
              console.log("Move bot to "+newpos+". Oldpos was "+oldpos+" max_Y=="+max_Y);
          }
      }
      function movestop(touches, el){
          var newpos = 0;
          var my = max_Y+12;
          var oldpos = parseInt(el.style.bottom);
          for (var i=0; i<touches.length; i++) {
              //ongoingTouches.push(touches[i]);
              newpos = touches[i]["clientY"] > my ? touches[i]["clientY"] : my;
              if(newpos < parseInt(window.innerHeight) - 24) el.style.top = newpos+'px';
              else el.style.display = 'none';
              console.log("Move top to "+newpos+". Oldpos was "+oldpos);
          }
      }
      function expand2w(off, text){
          var re = /[\s\.\;\"\,\<\>\(\)]/;
          for(var hiind = off; re.test(text.charAt(hiind))===false && hiind < text.length; hiind++){}
          for(var loind = off; re.test(text.charAt(loind))===false && loind > 0; loind--){}
          return text.slice(loind+1, hiind);
      }
      function selectword(off, el){
          var txt = el.textContent;//new String(el.textContent);
          try {
              var sel = window.getSelection();
              sel.removeAllRanges();
              var rng = document.createRange();
              rng.selectNode(el);
              rng.setStart(el, off);
              rng.setEnd(el, off+1);
              if(rng.expand){
                  rng.expand("word");
                  sel.addRange( rng );
                  selected_word = sel.toString();
                  console.log("Selected by rng.expand "+sel.toString());
              } else {
                  sel.addRange( rng );
                  sel.modify("extend", "backward", "word");
                  sel.collapseToStart();
                  sel.modify("extend", "forward", "word");
                  selected_word = sel.toString();
                  console.log("Selected by sel.modify "+sel.toString());
              }
          } catch(e) { selected_word = expand2w(off, txt); console.log("Got error "+e.stack+" using expand2w, got "+selected_word);}
          evo.dispatchEvent(got_sel_ev);
      }
      return {
          selected_word: function() { return selected_word; },
          max_Y: function() { return max_Y; },
          handleTouchstart:function (evt) {
              console.log("Touch start "+moveflag);
              timer = window.setTimeout(function(){moveflag=1}, 1024);
              liftflag = 1;
              //evt.preventDefault();
              handleTouch(evt, 1);
          },
          handleTouchend:function (evt) {
              console.log("Touch end "+moveflag);
              window.clearTimeout(timer);
              //evt.preventDefault();
              handleTouch(evt, 0);
              moveflag=0;
              liftflag = 0;
          },
          handleTouch:function (evt){
              console.log("Touch proceed "+moveflag);
              handleTouch(evt, 0);
          },
          handleclick:function(evt){
              if(hold === 0) hold=1;
              else hold = 0;
              console.log("click makes hold "+hold);
          },
          evo:evo
      }
  }
);
