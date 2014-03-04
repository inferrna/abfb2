define(['stuff', 'sharedc'],
function(stuff, sharedc){
    var text = [];
    var name = '';
    var currentpage = 0;
    function load_txt(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");//NFP
            proceedtxt(new String(evt.target.result));
        };
        Reader.readAsText(file);
        name = file.name;
    }
    function proceedtxt(txt){
        var maxlen = txt.length;
        var strip = 8192;
        var re = /\n|\./;
        var off = 0;
        var curstrip = strip;
        if(maxlen<strip){
            text.push(txt)
        }else {
            while(curstrip < maxlen){
                while(re.test(txt.charAt(curstrip))===false && curstrip < maxlen-1){curstrip++;}
                curstrip++;
                text.push(txt.substring(off, curstrip));
                //console.log("Got strip "+curstrip);
                off = curstrip; 
                curstrip += strip; 
            }
            if(curstrip<maxlen) text.push(txt.strip(curstrip, maxlen));
        }
        sharedc.exec('bookng', 'got_toc')();
        sharedc.exec('book', 'got_book')();
        //console.log(text[0]);
    }
    function get_indexed_page(index){
        if(index>-1){
            if(text[index]) return text[index];//decodeURIComponent( escape(resultDocument) ));
            else return null;
        }else{
            var contents = document.createElement("div");;
            var h1 = document.createElement("h1");
            h1.textContent = name;
            var sel = document.createElement("select");
            sel.id = "tocselect";
            for(var i = 0; i<text.length; i++){
                var opt = document.createElement("option");
                opt.id = i+1;
                opt.textContent = i+1;
                sel.appendChild(opt);
            }
            contents.appendChild(h1);
            contents.appendChild(sel);
            //console.log(contents);
            return contents;//.innerHtml;
        }
        return 0;
    }
    return {
             load:function(file, lib) {
                        //console.log("Loads txt file "+file.name);
                        load_txt(file);
             },
             get_page:function(index){
                     return get_indexed_page(index);
             },
             option:function(i){
                     return currentpage;
             },
             get_fromopt:function(idx){
                     currentpage = idx;
                     return get_indexed_page(currentpage);
             },
             currentpage:function(){
                     return currentpage;
             },
             next_page:function(diff){
                     //console.log(currentpage+" next_page "+diff);
                     var page = currentpage + diff;
                     if(text.length>page && page>-1) {
                            currentpage += diff;
                            return get_indexed_page(currentpage);
                     }
                     return -1;
             },
             init:function(){
                     text = [];
                     name = '';
                     sharedc.register('app', 'got_href', function(){sharedc.exec('bookng', 'got_fstfile')();});
             },
             get_href_byidx:function(){}
    }
}
);
