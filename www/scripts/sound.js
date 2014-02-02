define(
    ['stuff'],
  function(stuff){
        var urls = [];
        var idx = 0;
        var word = '';
        var audios = [];
        var snd = document.createElement("audio");
        snd.addEventListener("canplay", function(){
                                        if(audios[1]) audios[1].load();
                                        sndcnt.textContent = 1+"/"+urls.length;
                                        sndbt.style.display = 'block';
                                    });
        audios.push(snd);
        function add_audios(cnt){
            for(var i=0; i<(1+cnt-audios.length); i++){
                var snd = document.createElement("audio");
                var j = audios.length+i;
                snd.addEventListener("canplay", function(){if(audios[j+1]) audios[j+1].load();});
                audios.push(snd);
            }
        }
        function play(){
            nidx = idx+1;
            idx = nidx < urls.length ? nidx : 0;
            if(urls[idx]){
                audios[idx].play();
                sndcnt.textContent = (idx+1)+"/"+urls.length;
            }
        }

        var sndcnt = document.getElementById('sndcnt');
        var sndbt = document.getElementById('sndbt');
        var nosnd = document.getElementById('nosnd');
        sndbt.onclick=function(){play();};
        sndbt.style.height = Math.round(32*(window.devicePixelRatio || 1.0))+"px";
        sndbt.style.width = sndbt.style.height;
        sndbt.style.backgroundImage = 'url('+stuff.sndimg+')';

        return {
            get_sound:function(lword, lang){
               
               nosnd.style.display = 'none';
               sndbt.style.display = 'none';
               if(word!=lword){
                   idx = 0;
                   var url = "http://borgu.org:8082/sound?word="+lword+"&lang="+lang;
                   var dreq = new XMLHttpRequest({mozSystem: true});
                   dreq.onload = function (event) {
                            urls = JSON.parse(event.target.responseText);
                            word=lword;
                            if(urls.length>0){sndbt.style.display = 'inline'; nosnd.style.display = 'none'; sndcnt.textContent = 'Wait';}
                            else{sndbt.style.display = 'none'; nosnd.style.display = 'inline';}
                            if(urls.length > audios.length) add_audios(urls.length);
                            for(var i=0; i<audios.length; i++){
                                audios[i].src = urls[i];
                            }
                            audios[0].load();
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
