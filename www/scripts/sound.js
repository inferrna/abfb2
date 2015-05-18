define(
    ['sharedc', 'stuff', 'swac'],
  function(sharedc, stuff, swac){
        var count = 0;;
        var idx = 0;
        var word = '';
        var audios = [];
        var intrvl = null;
        var snd = document.createElement("audio");
        var sndcnt = document.getElementById('sndcnt');
        var sndbt = document.getElementById('sndbt');
        var nosnd = document.getElementById('nosnd');
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
        function play(evt){
            evt.stopPropagation();
            console.log("Clicked sndbt");//NFP
            console.log("count == "+count);//NFP
            if(count){
                audios[idx].load();
                clearInterval(intrvl);
                intrvl = setInterval(
                    function(){
                        if (audios[idx].readyState>0){
                            clearInterval(intrvl);
                            audios[idx].play();
                            console.log("Sound played");//NFP
                            nidx = idx+1;
                            idx = nidx < count ? nidx : 0;
                            sndcnt.textContent = (idx+1)+"/"+count;
                        } else {
                            console.log(audios[idx]);//NFP
                        }
                    }, 250);
                window.setTimeout(function(){clearInterval(intrvl);}, 5000);
            }
        }

        audios.push(snd);
        sndbt.addEventListener('click', play, false);
        sndbt.style.height = Math.round(32*(window.devicePixelRatio ? 1/window.devicePixelRatio : 1.0))+"px";
        sndbt.style.width = sndbt.style.height;
        sndbt.style.backgroundImage = 'url('+stuff.sndimg+')';
        sharedc.register('dict', 'change_lng', function(lang){
                       if(lang.length===2) var lidx = swac.lparts[lang];
                       else var lidx = lang;
                       swac.init(lidx, got_swac);
            });
        function got_swac(swpths){
               if(swpths && swpths.length>0){
                   idx = 0;
                   count  = swpths.length;
                   if(swpths.length > audios.length) add_audios(swpths.length);
                   for(var i=0; i<swpths.length; i++){
                       var pid = swpths[i][0];
                       var fnm = swpths[i][1];
                       audios[i].src = swac.swac['base']+swac.swac['paths'][pid]+fnm;
                   }
                   console.log("swpths:");//NFP
                   console.log(swpths);//NFP
                   sndbt.style.display = 'inline'; nosnd.style.display = 'none'; 
                   sndcnt.textContent = 1+"/"+count;
                   sndbt.style.display = 'block';
               } else {count = 0; sndbt.style.display = 'none'; nosnd.style.display = 'inline';}
        }

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
                   swac.get(idw);
               } else {
                   nidx = idx+1;
                   idx = nidx < count ? nidx : 0;
               }
            }
        }
  }
);
