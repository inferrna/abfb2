define(['jsepub', 'jsinflate', 'jsunzip', 'stuff', 'encod'],
function(jsepub, jsinflate, jsunzip, stuff, encod){
    var epub = null;
    var srlzr = new XMLSerializer();
    var xsltp = new XSLTProcessor();
    var parsr = new DOMParser();
    //console.log(unescape(stuff.tocxsl.replace(/&quot;/g,'"')));
    xsltp.importStylesheet(parsr.parseFromString(stuff.tocxsl.replace(/&quot;/g,'"'), 'text/xml'));
    var evo = document.createElement("br");
    var got_book_ev = new Event('got_book');
    var pages = [];
    var currentpage = 0;
    function load_jsepub(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");
            proceedepub(evt.target.result);
        };
        Reader.readAsBinaryString(file);
    }
    function proceedepub(epubFile){
        // Use HTML5 files or download via XHR.
        epub = new JSEpub(epubFile);
        epub.processInSteps(function (step, extras) {
                var msg;
                if (step === 1) {
                    msg = "Unzipping";
                } else if (step === 2) {
                    msg = "Uncompressing " + extras;
                } else if (step === 3) {
                    msg = "Reading OPF";
                } else if (step === 4) {
                    msg = "Post processing";
                } else if (step === 5) {
                    msg = "Finishing";
                    console.log(msg);
                    evo.dispatchEvent(got_book_ev);
                }
                // Render the "msg" here.
            });
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
    function get_true_id(url, id, text){
        for(var i = 0; i<epub.opf.spine.length;i++){
            var spine = epub.opf.spine[i];
            var href = epub.opf.manifest[spine]["href"];
            if(href===url) {
                //console.log(text+"i=="+i+" id=="+id+" href=="+href);
                return i+1;
            }
        }
        console.log(url+" not found");
        return id;
    }
    function get_indexed_page(index){
        if(index>-1){
            var spine = epub.opf.spine[index];
            var href = epub.opf.manifest[spine]["href"];
            var doc = epub.files[href];
            /*var div = document.createElement('div');
            //div.setAttribute
            //div.style.height = window.innerHeight+"px";
            div.style.width =  window.innerWidth+"px";
            while(doc.firstChild) div.appendChild(doc.firstChild);
            clean_tags(div, "html");
            clean_tags(div, "head");
            clean_tags(div, "body");
            console.log(div);*/
            var html = srlzr.serializeToString(doc);
            return html;//decodeURIComponent( escape(resultDocument) ));
        }else{
            var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
            var toc = epub.toc;
            //var texts = toc.childNodes[0].getElementsByTagName("texts");
            /*console.log(toc.childNodes[0]);
            console.log("The TOC is: ", texts.length);
            for(var i=0; i < texts.length; i++){
                console.log(text);
                texts[i].textContent = escape(texts[i].textContent);
            }*/
            var contents = xsltp.transformToDocument(toc,doc);
            var opts = contents.getElementsByTagName("option");

            var hrefs = [];
            var urls = [];
            var re = /([\w\/]+)\/(.*)/;
            for(var i = 0; i < opts.length; i++) {
                urls.push(opts[i].getAttribute('url').replace(re, "$2"));
            }
            console.log("urls is "+urls);
            for(var i = 0; i<epub.opf.spine.length;i++){
                var spine = epub.opf.spine[i];
                href = epub.opf.manifest[spine]['href'].replace(re, "$2");
                console.log(i+" href "+href+" "+epub.opf.manifest[spine]['href']);
                var index = urls.indexOf(href);
                pages.push(index);
            }
            console.log("pages is "+pages);
            var docFragment = document.createDocumentFragment();
            while(contents.firstChild) docFragment.appendChild(contents.firstChild);
            //console.log(encod.utf8b2str( encod.str2utf8b(contents.textContent) ));
            return docFragment;//contents;
        }
    }
    return {
             load:function(file, lib) {
                     if(lib==='jsepub') load_jsepub(file);
             },
             get_page:function(index){
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
                     epub = null;
                     pages = [];
                     currentpage = 0;
             },
             evo:evo
    }
}
);
