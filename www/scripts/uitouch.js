define(
    ['options', 'stuff', 'sharedc', 'book', 'frame'],
  function(options, stuff, sharedc, book, frame){
   //   "use strict";
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
      var targimg = document.createElement("image");
      var mtextfrm = document.getElementById('mainframe').contentDocument.body;
      targimg.src = stuff.targetimg;
      document.body.appendChild(targimg);
      targimg.style.display = 'none';
      targimg.style.position = "absolute";
      targimg.style.display = 'block';
      targimgw = stuff.getStyle(targimg, 'width');
      targimgh = stuff.getStyle(targimg, 'height');
      targimg.style.display = 'none';
      var reprefix = new RegExp(stuff.pprefix+"\\d+?");
      var scale = 1.0;
      var ispinch = 0;
      pop.style.display = 'none';
      var movef = function(){};
      function sign(x) { return x && x / Math.abs(x); }
      function liftcol(el, dir) {
          "use strict";
          var ptop, top;
          var wh = parseInt(window.innerHeight);
          var elh = Math.max(el.scrollHeight, wh);
          if(el.style.top) top=parseInt(el.style.top);
          else top = parseInt(stuff.getStyle(el, 'top'));
          ptop = parseInt(el.parentNode.parentNode.offsetHeight);
          var pageend = -parseInt(el.scrollHeight);
          var newtop = Math.ceil(top + dir*(ptop*(1.0-scale*0.025)));
          var oldpercent = -100*parseInt(top)/elh;
          var percent = -100*parseFloat(newtop)/elh;
          var dtop = stuff.getStyle(el.parentNode, 'top')-top;
          if(el.id==="maintext"){
              if(percent>100 || (dir===-1 && elh===wh)) {sharedc.exec('uitouch', 'next_chapter')(1); newtop=0;}
              else if (newtop>0) {
                      if(top===0) {sharedc.exec('uitouch', 'next_chapter')(-1); return;}
                      else newtop = 0;
                  } else {
                      if(newtop<pageend) newtop = pageend+ptop/2;
                      if (newtop>0) newtop = 0;
                  }
          }
          el.style.top = parseInt(newtop)+"px";
          if(el.id==="maintext"){
              percent = -100*parseFloat(newtop)/elh;
              options.setpercent(percent);
              console.log("saving.."); options.savepp();
          }
          sharedc.exec('uitouch', 'fix_toc')();
      }
      function expand2w(off, text){
          "use strict";
          var re = /[\s\.\;\"\,\<\>\(\)—\-\“]/;
          var spirale = [-1, 1, -2, 2, -3, 3];
          var newoff = 0;
          if(text.charAt(off).match(/\s/)){
              for(var i = 0; i<spirale.length; i++){
                  newoff = clip(off+spirale[i], 0, text.length);
                  if(!text.charAt(newoff).match(/\s/)) {off = newoff; break;} 
              }
          }
          for(var hiind = off; re.test(text.charAt(hiind))===false && hiind < text.length; hiind++){}
          for(var loind = off; re.test(text.charAt(loind))===false && loind > 0; loind--){}
          return text.slice(loind+1, hiind).replace(/(^\s)|[\.\!\?\,\;\:\"\“\)\(]|(\s$)/gm, "");
      }
      function expand23w(word, text, off){
          "use strict";
          var rep = /[\.\,\:\;\?\!—\)\(\"\“]/mg;
          var res = [];
          word = word.replace(rep, '');
          var newtexts = text.split(rep);
          var newtext = null, j=0, i=0;
          for(j=0; j<newtexts.length && i<off; j++){
                i+=(newtexts[j].length+1);
              }
          if(!newtext) newtext = newtexts[j-1];
          if(!newtext) newtext = text;
          var realwords = newtext.match(/[\w\S]{4,99}/mg);
          if(!realwords) return '';
          if(realwords.length<4) realwords = newtext.match(/[\w\S]{3,99}/mg);
          if(realwords.length<4) realwords = newtext.match(/[\w\S]{2,99}/mg);
          var idx = realwords.indexOf(word);
          var spirale = [-1, 1, -2, 2, -3, 3, -4, 4];
          for(i = 0; i<spirale.length && res.length<3; i++){
                var nw = realwords[idx+spirale[i]];
                if(nw && nw.length>0 && spirale[i]>0) var snt = newtext.slice(newtext.indexOf(word), newtext.indexOf(nw)+nw.length+1);
                if(nw && nw.length>0 && spirale[i]<0) var snt = newtext.slice(newtext.indexOf(nw), newtext.indexOf(word)+word.length+1);
                if(nw && snt && snt.length>0 && res.indexOf(snt)===-1) {res.push(snt); snt=null;}
          }
          if(newtext.length<99 && res.indexOf(newtext)===-1) res.push(newtext);
          return res;
      }
      function expand2s(off, text){
          "use strict";
          var re = /[\.\!\?]/;
          for(var hiind = off; re.test(text.charAt(hiind))===false && hiind < text.length; hiind++){}
          for(var loind = off; re.test(text.charAt(loind))===false && loind > 0; loind--){}
          var out = text.slice(loind===0 ? loind : loind+1, hiind===text.length ? hiind : hiind+1);
          return out;
      }
      function ispointinrect(rect, x, y){
          "use strict";
          try {
              var t = Math.max(rect.bottom, rect.top);
              var b = Math.min(rect.bottom, rect.top);
          } catch(e) {/*console.log(e.stack+"\n"+JSON.stringify(rect));*/ return false;}
          if(x>rect.left && x<rect.right && y>b && y<t) return true;
          else return false;
      }
      function ispointinrectlist(rectlist, x, y){
          "use strict";
          for(var i=0; i<rectlist.length; i++){
             if(ispointinrect(rectlist[i], x, y)) return i;
          }
          return -1;
      }
      function clip(_x, min, max) {return ( _x < min ) ? min : ( _x > max ) ? max : _x};
      function get_off(_x, _y, sidx){
          "use strict";
          if(!sidx) sidx=0;
          var dpr = window.devicePixelRatio || 1.0;
          var d = Math.max(2*scale*dpr, 1);
          var spirales = [[0,0], [1,1], [-1,1], [-1, -1], [1, -1],
                          [2, 0], [2, 2], [0, 2], [-2, 2], [-2, 0], [-2, -2], [0, -2], [2, -2],
                          [3, 0], [3, 3], [0, 3], [-3, 3], [-3, 0], [-3, -3], [0, -3], [3, -3],
                          [4, 0], [4, 4], [0, 4], [-4, 4], [-4, 0], [-4, -4], [0, -4], [4, -4]];
          var x = clip(Math.round(_x+spirales[sidx][0]*d), 0, window.innerWidth);
          var y = clip(Math.round(_y+spirales[sidx][1]*d), 0, window.innerHeigth)
          var el = document.elementFromPoint(x,y);
          var range = document.createRange();
          var z = 0;
          var gotit = 0;
          var retch = null;
          var nodes = Array.prototype.slice.call(el.childNodes).filter(function(node){return node.nodeType===3;});
          for(var j = 0; j<nodes.length; j++){
              var child = nodes[j];
              var clone = range.cloneRange();
              clone.selectNodeContents(child);
              for(var k = Math.floor(child.textContent.length/2); k>0; k = Math.floor(k/2)){
                  for(var i = z+k; i<child.textContent.length; i+=k){
                      try{clone.setEnd(clone.endContainer, i);}
                      catch(e){console.log(e.stack); break;}
                      if(ispointinrectlist(clone.getClientRects(), x, y)>-1){
                          z = i-k;
                          retch = child;
                          gotit++;
                          break;
                      }
                  }
               }
              clone.detach();
          }
          sidx++;
          if((gotit && retch.textContent.replace(/\s/g, '')!='') || sidx>=spirales.length){
              if(retch) {
                return [z, retch];
              }
          } else {
              return get_off(_x, _y, sidx);
          }
          return true;
      }
      function selectword(doc, x, y, rec){
          "use strict";
          max_Y = y + parseInt(mtext.style.top || 0); //Compensate vertical shift
          console.log("max_Y = "+max_Y);//NFP
          var off = -1;
          var el = null;
          if(doc.caretPositionFromPoint) {
              var cp = doc.caretPositionFromPoint(x, y);
              if(cp){
                off = cp.offset;
                el = cp.offsetNode;
              }
          } else if(doc.caretRangeFromPoint) {
              var cp = doc.caretRangeFromPoint(x, y);
              if(cp){
                  off = cp.startOffset;
                  el = cp.commonAncestorContainer;
              }
          } else {console.log("None of both document.caretRangeFromPoint or document.caretPositionFromPoint supports.");}
          if(el === doc.body){ cp = null; el = null; }
          if(!cp && doc.elementFromPoint){
              var goff = get_off(x, y);
              if(goff){off = goff[0]; el = goff[1];}
          }
          if(el){
              console.log("el.id=="+el.id);//NFP
              console.log("el==");//NFP
              console.log(el);//NFP
          }
          if(el && off>-1){
              var txt = el.textContent;//new String(el.textContent);
              var selected_word = null;
              try {
                  console.log("off=="+off);//NFP
                  var sel = window.getSelection();
                  sel.removeAllRanges();
                  var rng = doc.createRange();
                  rng.selectNode(el);
                  rng.setStart(el, off);
                  rng.setEnd(el, off+1);
                  if(rng.expand){
                      console.log("rng.expand and sel.addRange");//NFP
                      rng.expand("word");
                      sel.addRange( rng );
                      selected_word = sel.toString();
                  } else {
                      console.log("sel.modify and sel.collapseToStart");//NFP
                      sel.addRange(rng);
                      sel.modify("extend", "forward", "word");
                      sel.collapseToEnd();
                      sel.modify("extend", "backward", "word");
                      selected_word = sel.toString();
                  }
              } catch(e) { selected_word = expand2w(off, txt); 
                           console.log("Got error "+e.stack+" using expand2w, got "+selected_word+" off=="+off);
              }
              if(!selected_word || !selected_word.length){
                  selected_word = expand2w(off, txt);
              }
              if(selected_word && selected_word.length){                  
                  console.log("got "+selected_word+" off=="+off);
                  sharedc.exec('uitouch', 'got_selection')([selected_word.toLowerCase(), expand23w(selected_word, txt, off)]);
              }
          }
      }
      function chscale(cf, nochange){
            "use strict";
            var _scale = scale+0.0;
            if(isNaN(scale) || !scale) _scale = 1.0;
            var newscale = cf*_scale;
            if(Math.abs(1.0 - newscale) < 0.04) newscale = 1.0;
            _scale = newscale > 8.0 ? 8.0 : newscale < 0.25 ? 0.25 : newscale;
            console.log("scale == "+_scale)//NFP
            if(!nochange) scale = _scale;
            return _scale;
      }
      function apply_scale(){
            "use strict";
            frame.set_fontsize(scale);
            pop.style.fontSize = scale+'em';
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
              return true;
          },
          dragpop:function(y){
              if(y===-1) var ch = parseInt(stuff.getStyle(pts, 'height'))+(parseInt(stuff.getStyle(pts, 'font-size')) | 16);
              if(max_Y>window.innerHeight/2){
                  pop.style.top = "0px";
                  if(y===-1){
                      if(max_Y>ch) pop.style.bottom = (window.innerHeight-ch) + 'px';
                      else pop.style.bottom = Math.floor(window.innerHeight*0.75)+'px';
                  } else {
                      pop.style.bottom = parseInt(y<max_Y ? window.innerHeight-y : window.innerHeight-max_Y)+"px";
                  }
              } else {
                  pop.style.bottom = "0px";
                  if(y===-1){
                      if(max_Y<(window.innerHeight-ch)) pop.style.top = (window.innerHeight-ch)+'px';
                      else pop.style.top = Math.floor(window.innerHeight*0.75)+"px";
                  } else { 
                      pop.style.top = Math.floor(y>max_Y ? y : max_Y*0.75)+"px";
                  }
              }
              pop.style.height = "auto";
          },
          handleClick:function(evt){
              targimg.style.left = (evt.center.x-(targimgw||8)/2)+"px";
              targimg.style.top = (evt.center.y-(targimgh||8)/2)+"px";
              targimg.style.display = 'block';
              console.log(evt.srcEvent.target);//NFP
              var doc = evt.target.ownerDocument;
              selectword(doc, evt.center.x, evt.center.y);
              console.log("target is");//NFP
              console.log(evt.target);//NFP
              window.setTimeout(function(){targimg.style.display = 'none';}, 256);
          },
          handleKey:function(evt){
              var Code = parseInt(evt.keyCode);
              if([37,38,39,40,107,187,109,189].indexOf(Code)===-1) return;
              evt.stopPropagation();
              evt.preventDefault();
              var el = pop.style.display === 'none' ? mtext: pts;//document.getElementById(stuff.pprefix+book.currentpage())
              if(Code===37) liftcol(el, 1);
              else if (Code===39) liftcol(el, -1);
              else if (Code===38) {options.display('hide'); pop.style.display='none';}
              else if (Code===40) options.display('show');
              else if ([107,109,187,189].indexOf(Code)!=-1) {
                  var cf = Code===107||Code===187 ? 1.05 : 1.0/1.05;
                  chscale(cf);
                  apply_scale();
              }
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
              sharedc.exec('uitouch', 'got_selection')([selected_word, '']);
          },
          doscale:function(cf, apply){
              //cf = cf > 1.05 ? 1.05 : cf < 1/1.05 ? 1/1.05 : cf;
              var res = chscale(cf, !apply);
              if(apply) apply_scale();
              return res;
          },
          init_scale:function(newscale){
              if(newscale && newscale > 0.25 && newscale < 8.0){
                  scale = newscale;
                  apply_scale();
              } else {
                  options.get_opt('scale', function(sc){
                          var _scale = parseFloat(sc);
                          if(_scale > 0.25 && _scale < 8.0 || !isNaN(_scale) ){
                              scale = _scale;
                              chscale(1.0);
                          } else {
                              scale = 1.0;
                          }
                          apply_scale();
                      }, true);
              }

          }
      }
  }
);
