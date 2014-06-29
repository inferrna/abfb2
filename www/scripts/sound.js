define(
    ['stuff'],
  function(stuff){
        var urls = [];
        var idx = 0;
        var word = '';
        var audios = [];
        var snd = document.createElement("audio");
        function canplay(){
             if(audios[1]) audios[1].load();
             sndcnt.textContent = 1+"/"+urls.length;
             sndbt.style.display = 'block';
        }
        function add_audios(cnt){
            for(var i=0; i<(1+cnt-audios.length); i++){
                var snd = document.createElement("audio");
                var j = audios.length+i;
                //snd.addEventListener("canplay", function(){if(audios[j+1]) audios[j+1].load();});
                audios.push(snd);
            }
        }
        function play(){
            nidx = idx+1;
            idx = nidx < urls.length ? nidx : 0;
            if(urls[idx]){
                audios[idx].load();
                audios[idx].play();
                sndcnt.textContent = (idx+1)+"/"+urls.length;
            }
        }

        snd.addEventListener("canplay", canplay);
        snd.addEventListener("loadeddata", canplay);
        snd.addEventListener("loadstart", canplay);//Too early
        snd.addEventListener("canplaythrough", canplay);
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
               if(lword.split(/\s/gm).length>1){
                   nosnd.style.display = 'inline';
                   return;
               }
               nosnd.style.display = 'none';
               if(word!=lword){
                   idx = 0;
                   var url = "http://borgu.org:8082/sound?word="+lword+"&lang="+lang;
                   var dreq = new XMLHttpRequest({mozSystem: true});
                   dreq.onload = function (event) {
                            console.log("some sounds loaded from "+url+":");//NFP
                            console.log(event.target.responseText);//NFP
                            urls = JSON.parse(event.target.responseText);
                            word = lword;
                            if(urls.length > audios.length) add_audios(urls.length);
                            for(var i=0; i<urls.length; i++){
                                audios[i].src = urls[i];
                            }
                            if(urls.length>0){
                                console.log("urls:");//NFP
                                console.log(urls);//NFP
                                sndbt.style.display = 'inline'; nosnd.style.display = 'none'; 
                                if(snd.readyState<3) sndcnt.textContent = 'Wait';
                                else sndcnt.textContent = 1+"/"+urls.length;
                                audios[0].load();
                            } else {sndbt.style.display = 'none'; nosnd.style.display = 'inline';}
                       };
                   dreq.open("GET", url, "true");
                   dreq.send();
               } else {
                   nidx = idx+1;
                   idx = nidx < urls.length ? nidx : 0;
                   if(urls[idx]){
                       audios[idx].play();
                   }
               }
            }
        }
  }
);
