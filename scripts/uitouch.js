define(
    ['options', 'stuff', 'gestures'],
  function(options, stuff, gest){
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
      var scale = 1.0;
      var ispinch = 0;
      pop.style.display = 'none';
      var callbacks = {'got_selection':function(){}, 'next_chapter':function(){}};
      var movef = function(){};
      function sign(x) { return x && x / Math.abs(x); }
      function handleTouch(evt, start) {
          var touchlists = evt.changedTouches;

          //console.log(touchlists.length+" touches total");
          if(start===1){
              syG = touchlists[0].clientY;
              sxG = touchlists[0].clientX;
          }
          var x = touchlists[touchlists.length-1].clientX;
          var y = touchlists[touchlists.length-1].clientY;
          var dx = x - sxG;
          var dy = y - syG;
          //console.log("Start: ", dx, dy, dictflag )
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
              var sel = window.getSelection();
              if(sel.anchorNode) sel.collapse(sel.anchorNode, 0);
              //console.log("Hide opts");
          } else if(dictflag===1) {
              if(theitm!='pop'){
                  selectword(x, y);
              } else {
                  sxG = x;
                  syG = y;
                  var el = pop;//evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
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
          var fs = parseInt(stuff.getStyle(el, 'font-size'));
          var wh = parseInt(window.innerHeight);
          var elh = Math.max(parseInt(stuff.getStyle(el, 'height')), wh);
          if(el.style.top==='' || el.style.top==='undefined' || el.style.top===null) top = 0;
          else top = parseInt(stuff.getStyle(el, 'top'));
          ptop = parseInt(el.parentNode.parentNode.offsetHeight);
          var pageend = -parseInt(stuff.getStyle(el, 'height'));
          var newtop = top + dir*(ptop-fs);
          var oldpercent = -100*parseInt(top)/elh;
          var percent = -100*parseInt(newtop)/elh;
          if(el.id==="maintext"){
              if(percent>100) {callbacks['next_chapter']( 1); newtop=0;}
              else if (newtop>0) {
                  if(top===0) {callbacks['next_chapter'](-1); return;}
                  else {newtop = 0;}
              } else {
                  options.setpercent(percent);
                  options.savepp();
              }
          } else {
              if(newtop<pageend) newtop = pageend+ptop/2;
              if (newtop>0) newtop = 0;
          }
          //console.log("top=="+top+"  pageend=="+pageend+"  newtop=="+newtop+"  oldpercent="+oldpercent+"  el=="+el.id);
          el.style.top = parseInt(newtop)+"px";
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
          //console.log("Got sentence: "+out);
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
      function chscale(cf, apply){
            var _scale = scale*cf;
            if(_scale > 8.0 || _scale < 0.25 || isNaN(_scale)){
                console.warn("Illegal scale factor: "+_scale);
                return;
            }
            options.msg("Current scale factor = "+_scale);
            if(apply===1) scale = _scale;
      }
      function apply_scale(){
            var txarea = document.getElementById('txtarea');
            //var txarea = mtext.parentNode;
            var nw = parseInt(window.innerWidth)/scale;
            var nh = parseInt(window.innerHeight)/scale;
            var cf = (1.0*nh)/parseInt(stuff.getStyle(txarea, 'height'));
            txarea.style.width  = parseInt(nw)+"px";
            txarea.style.height = parseInt(nh)+"px";
            var stscale = "scale("+scale+")";
            //console.log("Got nhw == "+nw+", "+nh+" | stscale=="+stscale+" scale=="+scale);
            txarea.style.transform = stscale;
            txarea.style.transformOrigin = "0 0";
            txarea.style.WebkitTransform = stscale;
            txarea.style.WebkitTransformOrigin = "0 0";
            mtext.style.width = 'auto';
            mtext.style.height = 'auto';
            var pts = document.getElementById('pts');
            var pt =  document.getElementById('pt');
            nh = parseInt(stuff.getStyle(pt, 'height'))*cf;
            pt.style.width  = parseInt(nw)+"px";
            pt.style.transform = stscale;
            pt.style.transformOrigin = "0 0";
            pt.style.WebkitTransform = stscale;
            pt.style.WebkitTransformOrigin = "0 0";
            pt.style.height = 'auto';
            pts.style.width = 'auto';
            pts.style.height = 'auto'; 
            options.set_opt('scale', scale);
            var cp = options.getpercent();
            options.setpercent(cp);
      }
      return {
          selected_word: function() { return selected_word; },
          max_Y: function() { return max_Y; },
          handleTouchstart:function (evt, itm) {
              if(itm!='none') evt.preventDefault();
              else return false;
              timer = window.setTimeout(function(){dictflag=1;}, 1024);
              liftflag = 1;
              movef = null;
              theitm = itm;
              if(!gest.ispinch(evt))  handleTouch(evt, 1);
          },
          handleTouchend:function (evt, itm) {
              if(itm!='none') evt.preventDefault();
              else return false;
              //console.log("Touch end "+dictflag);
              window.clearTimeout(timer);
              //evt.preventDefault();
              //handleTouch(evt, 0);
              dictflag=0;
              liftflag = 0;
              movef = null;
              chscale(gest.coeff(), 1);
              apply_scale();
              gest.clear();
          },
          handleTouch:function (evt, itm){
              if(itm!='none') evt.preventDefault();
              else return false;
              if(gest.ispinch(evt)){
                  window.clearTimeout(timer);
                  dictflag=0;
                  liftflag = 0;
                  movef = null;
                  chscale(gest.coeff(), 0);
              } else {
                  if(movef!=null) movef(evt.changedTouches, pop);
                  else handleTouch(evt, 0);
                  //ispinch = 0;
                  //distg = 0;
              }
          },
          handleClick:function(evt){
              selectword(evt.clientX, evt.clientY);
          },
          handleKey:function(evt){
              var Code = parseInt(evt.keyCode);
              //console.log("Got code "+Code);
              if([37,38,39,40,107,187,109,189].indexOf(Code)===-1) return;
              evt.stopPropagation();
              evt.preventDefault();
              var el = pop.style.display === 'none' ? mtext : pts;
              console.log("el=="+el.id+" code=="+Code);
              if(Code===37) liftcol(el, 1);
              else if (Code===39) liftcol(el, -1);
              else if (Code===38) {options.display('hide'); pop.style.display='none';}
              else if (Code===40) options.display('show');
              else if ([107,109,187,189].indexOf(Code)!=-1) {
                  var cf = Code===107||Code===187 ? 1.075 : 1.0/1.075;
                  chscale(cf, 1);
                  apply_scale();
              }

              //console.log("Got "+Code+" code");
          },
          handlegest:function(e){
              chscale(e.scale);
          },
          handleSelect:function(evt){
              var sel = window.getSelection();
              selected_word = sel.toString();
              callbacks['got_selection']([selected_word, '']);
          },
          add_callback:function(key, fcn){
              callbacks[key] = fcn;
          },
          init_scale:function(){
              //console.log("Init scale");
              options.get_opt('scale', function(sc){
                      //console.log("Got saved scale "+sc);
                      var _scale = parseFloat(sc);
                      if(_scale > 0.25 && _scale < 8.0 || !isNaN(_scale) ){
                          scale = _scale;
                          chscale(1.0);
                          apply_scale();
                      } else {
                          scale = 1.0;
                      }
                  });

          }
      }
  }
);
