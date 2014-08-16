define(
    ['stuff', 'swac'],
  function(stuff, swac){
        var swpths = [];
        var idx = 0;
        var word = '';
        var audios = [];
        var intrvl = null;
        var snd = document.createElement("audio");
        snd.preload = "metadata";
        function utf8_to_b64( str ) {
            return window.btoa(encodeURIComponent( escape( str )));
        }

        function b64_to_utf8( str ) {
            return unescape(decodeURIComponent(window.atob( str )));
        }

        function canplay(){
        }
        function add_audios(cnt){
            for(var i=0; i<(1+cnt-audios.length); i++){
                var nsnd = document.createElement("audio");
                nsnd.preload = "metadata";
                var j = audios.length+i;
                audios.push(nsnd);
            }
        }
        function play(){
            if(swpths[idx]){
                audios[idx].load();
                clearInterval(intrvl);
                intrvl = setInterval(
                    function(){
                        if (audios[idx].readyState>0){
                            clearInterval(intrvl);
                            audios[idx].play();
                            nidx = idx+1;
                            idx = nidx < swpths.length ? nidx : 0;
                            sndcnt.textContent = (idx+1)+"/"+swpths.length;
                        } else {
                        }
                    }, 250);
                window.setTimeout(function(){clearInterval(intrvl);}, 5000);
            }
        }

        /*snd.addEventListener("canplay", canplay);
        snd.addEventListener("loadeddata", canplay);
        snd.addEventListener("loadstart", canplay);//Too early
        snd.addEventListener("canplaythrough", canplay);*/
        audios.push(snd);
        var sndcnt = document.getElementById('sndcnt');
        var sndbt = document.getElementById('sndbt');
        var nosnd = document.getElementById('nosnd');
        sndbt.onclick=function(){play();};
        sndbt.style.height = Math.round(32*(window.devicePixelRatio || 1.0))+"px";
        sndbt.style.width = sndbt.style.height;
        sndbt.style.backgroundImage = 'url('+stuff.sndimg+')';

        return {
            get_sound:function(lword, lang){
               sndbt.style.display = 'none';
               var rep = /[\.\,\:\;\?\!\'\)\(\"\“]/mg;
               lword = lword.replace(rep, '');
               if(lword.split(/\s/gm).length>1){
                   nosnd.style.display = 'inline';
                   return;
               }
               nosnd.style.display = 'none';
               if(word!=lword){
                   var idw = utf8_to_b64(lword);
                   if(lang.length===2) lidx = swac.lparts[lang];
                   else lidx = lang;
                   swpths = swac.swac['langs'][lidx][idw];
                   if(swpths && swpths.length>0){
                       idx = 0;
                       if(swpths.length > audios.length) add_audios(swpths.length);
                       for(var i=0; i<swpths.length; i++){
                           var pid = swpths[i][0];
                           var fnm = swpths[i][1];
                           audios[i].src = swac.swac['base']+swac.swac['paths'][pid]+fnm;
                       }
                       sndbt.style.display = 'inline'; nosnd.style.display = 'none'; 
                       sndcnt.textContent = 1+"/"+swpths.length;
                       sndbt.style.display = 'block';
                   } else {sndbt.style.display = 'none'; nosnd.style.display = 'inline';}
               } else {
                   nidx = idx+1;
                   idx = nidx < swpths.length ? nidx : 0;
               }
            }
        }
  }
);
