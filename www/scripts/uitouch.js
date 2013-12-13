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
          console.log("elh == "+stuff.getStyle(el, 'height'));
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
                  console.log("saving.."); options.savepp();
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
      function ispointinrect(rect, x, y){
          try {
              var t = Math.max(rect.bottom, rect.top);
              var b = Math.min(rect.bottom, rect.top);
          } catch(e) {/*console.log(e.stack+"\n"+JSON.stringify(rect));*/ return false;}
          if(x>rect.left && x<rect.right && y>b && y<t) return true;
          else return false;
      }
      function ispointinrectlist(rectlist, x, y){
          //console.log(JSON.stringify(rectlist));
          for(var i=0; i<rectlist.length; i++){
             if(ispointinrect(rectlist[i], x, y)) return i;
          }
          return -1;
      }
      function get_off(el, x, y){
          var range = document.createRange();
          var z = 0;
          var retch = null;
          for(var j = 0; j<el.childNodes.length; j++){
              var child = el.childNodes[j];
              if(child.nodeType===3){
                  var clone = range.cloneRange();
                  clone.selectNodeContents(child);
                  for(var k = Math.floor(child.textContent.length/2); k>0; k = Math.floor(k/2)){
                      for(var i = z+k; i<child.textContent.length && clone.endContainer.nodeType===3; i+=k){
                          try{clone.setEnd(clone.endContainer, i);}
                          catch(e){console.log(e.stack); break;}
                          if(ispointinrectlist(clone.getClientRects(), x, y)>-1){
                              //console.log(j+")"+i+") selected: "+clone.toString());
                              z = i-k;
                              retch = child;
                              //console.log("z=="+z);
                              break;
                          }
                      }
                   }
                  /*for(var i = 0; i<child.textContent.length && clone.endContainer.nodeType===3; i++){
                      try{clone.setEnd(clone.endContainer, i);}
                      catch(e){console.log(e.stack); break;}
                      //console.log(j+")"+i+") selected: "+clone.toString());
                      if(ispointinrectlist(clone.getClientRects(), x, y)>-1){
                          var el = child;
                          return [i, el];
                      }
                  }*/
                  clone.detach();
              }
          }
          return [z, retch];
      }
      function selectword(x, y, _el){
          max_Y = y;
          console.log("x=="+x+" y=="+y);
          if(document.caretPositionFromPoint) {
              var cp = document.caretPositionFromPoint(x, y);
              if(cp){
                var off = cp.offset;
                var el = cp.offsetNode || _el;
              } else {
                  var el = document.elementFromPoint(x,y);
                  var goff = get_off(el, x, y);
                  if(goff){var off = goff[0]; el = goff[1];}
              }
          } else if(document.caretRangeFromPoint) {
              var cp = document.caretRangeFromPoint(x, y);
              if(cp){
                  var off = cp.startOffset;
                  var el = cp.commonAncestorContainer || _el;
              } else {
                  var el = document.elementFromPoint(x,y);
                  var goff = get_off(el, x, y);
                  if(goff){var off = goff[0]; el = goff[1];}
              }
          } else {console.log("None of both document.caretRangeFromPoint or document.caretPositionFromPoint supports.");}
          if(el && off){
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
              } catch(e) { selected_word = expand2w(off, txt); console.log("Got error "+e.stack
                                +" using expand2w, got "+selected_word+" off=="+off+"txt=="+txt);}
              callbacks['got_selection']([selected_word, '']);//expand2s(off, txt)]);// evo.dispatchEvent(got_sel_ev);
          }
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
            options.set_opt('scale', scale, true);
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
          handleClick:function(evt){
              console.log("evt=="+evt.target+" evt.clientX=="+evt.clientX+" evt.clientY=="+evt.clientY);
              //evt.stopPropagation();
              //evt.preventDefault();
              selectword(evt.clientX, evt.clientY, evt.target);
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
          liftcol:function(el, id){
              liftcol(el, id);
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
          doscale:function(cf){
              chscale(cf, 1);
              apply_scale();
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
                  }, true);

          }
      }
  }
);
