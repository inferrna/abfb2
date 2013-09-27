define(['stuff'],
function(stuff){
    var text = [];
    var name = '';
    //console.log(unescape(stuff.tocxsl.replace(/&quot;/g,'"')));
    var evo = document.createElement("br");
    var got_book_ev = new Event('got_book');
    function load_txt(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");
            proceedtxt(new String(evt.target.result));
        };
        Reader.readAsText(file);
        name = file.name;
    }
    function proceedtxt(txt){
        var maxlen = txt.length;
        var strip = 4096;
        var re = /\n|\./;
        var off = 0;
        var curstrip = strip;
        while(curstrip < maxlen){
            while(re.test(txt.charAt(curstrip))===false && curstrip < maxlen-1){curstrip++;}
            curstrip++;
            text.push(txt.substring(off, curstrip));
            console.log("Got strip "+curstrip);
            off = curstrip; 
            curstrip += strip; 
        }
        if(curstrip<maxlen) text.push(txt.strip(curstrip, maxlen));
        evo.dispatchEvent(got_book_ev);
        //console.log(text[0]);
    }
    function get_indexed_page(index){
        if(index>-1){
            return text[index];//decodeURIComponent( escape(resultDocument) ));
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
            console.log(contents);
            return contents;//.innerHtml;
        }
        return 0;
    }
    return {
             load:function(file, lib) {
                        console.log("Loads txt file "+file.name);
                        load_txt(file);
             },
             get_page:function(index){
                     return get_indexed_page(index);
             },
             evo:evo
    }
}
);
