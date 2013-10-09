define(['stuff'],
function(stuff){
    var fb2 = document.createElement('div');//document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);//;
    var srlzr = new XMLSerializer();
    var xsltp = new XSLTProcessor();
    var parsr = new DOMParser();
    //console.log(unescape(stuff.tocxsl.replace(/&quot;/g,'"')));
    xsltp.importStylesheet(parsr.parseFromString(stuff.fb2xsl.replace(/&quot;/g,'"').replace(/&amp;/g,'\''), 'text/xml'));
    var evo = document.createElement("br");
    var got_book_ev = new Event('got_book');
    var pages = [];
    var divs = [];
    var currentpage = 0;
    function load_fb2(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");
            proceedfb2(evt.target.result);
        };
        Reader.readAsText(file);
    }
    function proceedfb2(fb2File){
        var xml = parsr.parseFromString(fb2File,'text/xml');
        var resultDocument = xsltp.transformToFragment(xml, document);
        fb2.appendChild(resultDocument);
        var divlist = fb2.getElementsByTagName('div');
        var re = /TOC_.+/g;
        clean_tags(fb2, 'script');
        clean_tags(fb2, 'a');
        //while(fb2.firstChild && fb2.firstChild!)
        for(var i = 0; i < divlist.length; i++)
            if(re.test(divlist[i].getAttribute('id'))){ 
                divs.push(divlist[i]);//.getAttribute('id'));
        }
        evo.dispatchEvent(got_book_ev);
        console.log("fb2 pages is "+pages);
    }
    function clean_tags(doc, tag){
            var tags = doc.getElementsByTagName(tag);
            for (var i = 0, il = tags.length; i < il; i++) {
                var fragment = document.createDocumentFragment();
                var ltag = tags[i];
                while(ltag.firstChild) {
                    fragment.appendChild(ltag.firstChild);
                }
                ltag.parentNode.replaceChild(fragment, ltag);
            }
    }
    function get_indexed_page(index){
        if(index>-1){
            var ch = divs[index];//document.getElementById(pages[index]);
            var html = srlzr.serializeToString(ch);
            //console.log("html== "+html+" id=="+index);
            return html;
        }else{
            var result = document.createElement('div');//document.createDocumentFragment();;//document.createElement('div');
            var toc = fb2.getElementsByTagName('select')[0].cloneNode(true);
            var options = fb2.getElementsByTagName('option');
            options[0].setAttribute('disabled', '');
            options[0].setAttribute('selected', '');
            var values = [];
            for(var i = 0; i<options.length; i++)
                values.push(options[i].getAttribute('did'))
            for(var i = 0; i<divs.length; i++){
                pages.push(values.indexOf(divs[i].getAttribute('id')));
                //console.log(divs[i].getAttribute('id'));
            }
            //console.log("values is "+values);
            toc.setAttribute('id', 'tocselect');
            result.appendChild(toc);
            //var html = srlzr.serializeToString(toc);
            //return html;//decodeURIComponent( escape(resultDocument) ));
            //console.log("fb2 toc is "+toc);
            //var docFragment = document.createDocumentFragment();
            //while(toc.firstChild) docFragment.appendChild(toc.firstChild);
            //console.log(encod.utf8b2str( encod.str2utf8b(contents.textContent) ));
            return result;//docFragment;//contents;
        }
    }
    return {
             load:function(file, lib) {
                     load_fb2(file);
             },
             get_page:function(index){
                     currentpage = index;//();
                     return get_indexed_page(index);
             },
             option:function(i){
                     if(pages[currentpage]>-1) return pages[currentpage];
                     return i;
             },
             get_fromopt:function(idx){
                     currentpage = idx;
                     var tidx = pages.indexOf(idx);
                     if(tidx>-1) currentpage = tidx;
                     return get_indexed_page(currentpage);
             },
             currentpage:function(){
                     return currentpage;
             },
             next_page:function(diff){
                     console.log(currentpage+" next_page "+diff);
                     var page = currentpage + diff;
                     if(pages.length>page && page>-1) {
                            currentpage += diff;
                            return get_indexed_page(currentpage);
                     }
                     return -1;
             },
             init:function(){
                fb2 = document.createElement('div');//document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);//;
                pages = [];
                divs = [];
                currentpage = 0;
             },
             evo:evo
    }
}
);
