define(
    ['options', 'stuff'],
  function(options, stuff){
      var dictflag = 0;
      var liftflag = 0;
      var hold = 0;
      var timer = null;
      var sxG = 0;
      var syG = 0;
      var max_Y = 0;
      var theitm = 'undefined';
      var selected_word = '';
      var pts = document.getElementById('pts');
      var mtext = document.getElementById('maintext');
      var pop = document.getElementById('pop');
      pop.style.display = 'none';
      var callbacks = {'got_selection':function(){}, 'next_chapter':function(){}};
      var movef = function(){};
      function sign(x) { return x && x / Math.abs(x); }
      function handleTouch(evt, start) {
          var touchlists = evt.changedTouches;
          //console.log(type);
          if(start===1){
              syG = touchlists[0].clientY;
              sxG = touchlists[0].clientX;
          }
          var x = touchlists[touchlists.length-1].clientX;
          var y = touchlists[touchlists.length-1].clientY;
          var dx = x - sxG;
          var dy = y - syG;
          //console.log(dx, dy, x, y, sxG, syG, theitm);
          if(Math.abs(dx)>64){
              //evt.preventDefault();
              window.clearTimeout(timer);
              dictflag = 0;
              if(liftflag===1){
                  if(theitm!='pop'){
                      //console.log("Lift mtext, target is "+evt.target);
                      liftcol(mtext, sign(dx));
                  } else{liftcol(pts, sign(dx));}
                  liftflag = 0;
              }
              sxG = x; syG = y;
              //console.log(evt);
              return;
          } else if (dy>64 && theitm!='pop'){
              //evt.preventDefault();
              window.clearTimeout(timer);
              dictflag = 0;
              options.display('show');
              sxG = x; syG = y;
              //console.log("Show opts");
          } else if (dy<-64 && theitm!='pop'){
              //evt.preventDefault();
              window.clearTimeout(timer);
              dictflag = 0;
              options.display('hide');
              sxG = x; syG = y;
              pop.style.display = 'none';
              //console.log("Hide opts");
          } else if(dictflag===1) {
              //evt.preventDefault();
              //console.log("flag == "+dictflag);
              if(theitm!='pop'){
                  /*var touch = touchlists[0];//touches.length-1];
                  var win = chrome.app.window.current();
                  var winc = win.contentWindow;//.Document()
                  var doc = winc.Document();*/
                  selectword(x, y);
              } else {
                  sxG = x;
                  syG = y;
                  //console.log("dy== "+dy);
                  //console.log("Touch proceed");
                  //evt.preventDefault();
                  var el = pop;//evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
                  //console.log("Target is "+evt.target.id);
                  //if(evt.target.id==='drugtop') 
                  if(el.style.top === '0px') movef = movesbot;//(touchlists, el);
                  else if(el.style.bottom === '0px') movef = movestop;//(touchlists, el);
                  else { console.log("No action. "+el.style.bottom+" x "+el.style.top); return; }
                  movef(touchlists, el);
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
          var pageend = parseInt(-(el_rectO.height));
          var newtop = top+dir*(ptop-8);
          if(el.id==="maintext"){
              if(newtop<pageend) {callbacks['next_chapter']( 1); newtop=0;}
              else if (newtop>0) {
                  if(top===0) {callbacks['next_chapter'](-1); return;}
                  else {newtop = 0;}
              } else {
                  var el_rectO = mtext.getBoundingClientRect();
                  options.setpercent(-100*parseInt(newtop)/el_rectO.height);
                  options.savepp();
              }
          } else {
              if(newtop<pageend) newtop = pageend+ptop/2;
              if (newtop>0) newtop = 0;
          }
          el.style.top = newtop+"px";
      }
      function movesbot(touches, el){
          var newpos = 0;
          var my = max_Y-12;
          var oldpos = parseInt(el.style.bottom);
          for (var i=touches.length-1; i<touches.length; i++) {
              newpos = touches[i].clientY < my ? window.innerHeight - touches[i].clientY : window.innerHeight - my;
              if(newpos < parseInt(window.innerHeight) - 24) el.style.bottom = newpos+'px';
              else el.style.display = 'none';
          }
      }
      function movestop(touches, el){
          var newpos = 0;
          var my = max_Y+12;
          var oldpos = parseInt(el.style.bottom);
          for (var i=touches.length-1; i<touches.length; i++) {
              newpos = touches[i].clientY > my ? touches[i].clientY : my;
              if(newpos < parseInt(window.innerHeight) - 24) el.style.top = newpos+'px';
              else el.style.display = 'none';
          }
      }
      function expand2w(off, text){
          var re = /[\s\.\;\"\,\<\>\(\)]/;
          for(var hiind = off; re.test(text.charAt(hiind))===false && hiind < text.length; hiind++){}
          for(var loind = off; re.test(text.charAt(loind))===false && loind > 0; loind--){}
          return text.slice(loind+1, hiind);
      }
      function expand2s(off, text){
          var re = /[\.\!\?]/;
          for(var hiind = off; re.test(text.charAt(hiind))===false && hiind < text.length; hiind++){}
          for(var loind = off; re.test(text.charAt(loind))===false && loind > 0; loind--){}
          var out = text.slice(loind===0 ? loind : loind+1, hiind===text.length ? hiind : hiind+1);
          console.log("Got sentence: "+out);
          return out;
      }
      function selectword(x, y){
          max_Y = y;
          if(document.caretPositionFromPoint) {
              var cp = document.caretPositionFromPoint(x, y);
              var off = cp.offset;
              var el = cp.offsetNode;
          } else if(document.caretRangeFromPoint) {
              var cp = document.caretRangeFromPoint(x, y);
              var off = cp.startOffset;
              var el = cp.startContainer;
          } else {console.log("None of both document.caretRangeFromPoint or document.caretPositionFromPoint supports."); 
                  soffset = 512;
                  target = mtext;}
          //soffset = caret.offset|caret.startOffset;
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
                  //console.log("Selected by rng.expand "+sel.toString());
              } else {
                  sel.addRange( rng );
                  sel.modify("extend", "backward", "word");
                  sel.collapseToStart();
                  sel.modify("extend", "forward", "word");
                  selected_word = sel.toString();
                  //console.log("Selected by sel.modify "+sel.toString());
              }
          } catch(e) { selected_word = expand2w(off, txt); console.log("Got error "+e.stack+" using expand2w, got "+selected_word);}
         callbacks['got_selection']([selected_word, '']);//expand2s(off, txt)]);// evo.dispatchEvent(got_sel_ev);
      }
      return {
          selected_word: function() { return selected_word; },
          max_Y: function() { return max_Y; },
          handleTouchstart:function (evt, itm) {
              if(itm!='none') evt.preventDefault();
              else return;
              //console.log("Touch start "+dictflag);
              timer = window.setTimeout(function(){dictflag=1}, 1024);
              liftflag = 1;
              movef = null;
              theitm = itm;
              //evt.preventDefault();
              handleTouch(evt, 1);
          },
          handleTouchend:function (evt, itm) {
              if(itm!='none') evt.preventDefault();
              else return;
              //console.log("Touch end "+dictflag);
              window.clearTimeout(timer);
              //evt.preventDefault();
              handleTouch(evt, 0);
              dictflag=0;
              liftflag = 0;
              movef = null;
          },
          handleTouch:function (evt, itm){
              if(itm!='none') evt.preventDefault();
              else return;
              //console.log("Touch proceed "+dictflag);
              if(movef!=null) movef(evt.changedTouches, pop);
              else handleTouch(evt, 0);
          },
          handleClick:function(evt){
              selectword(evt.clientX, evt.clientY);
          },
          handleKey:function(evt){
              var Code = parseInt(evt.keyCode);
              if([37,38,39,40].indexOf(Code)===-1) return;
              evt.stopPropagation();
              evt.preventDefault();
              var el = pop.style.display === 'none' ? mtext : pts;
              if(Code===37) liftcol(el, 1);
              else if (Code===39) liftcol(el, -1);
              else if (Code===38) {options.display('hide'); pop.style.display='none';}
              else if (Code===40) options.display('show');
              //console.log("Got "+Code+" code");
          },
          handleSelect:function(evt){
              var sel = window.getSelection();
              selected_word = sel.toString();
              callbacks['got_selection']([selected_word, '']);
          },
          add_callback:function(key, fcn){
              callbacks[key] = fcn;
          }
      }
  }
);
