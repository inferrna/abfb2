define(['jsepub', 'jsinflate', 'jsunzip', 'stuff', 'encod'],
function(jsepub, jsinflate, jsunzip, stuff, encod){
    var epub = null;
    var srlzr = new XMLSerializer();
    var xsltp = new XSLTProcessor();
    var parsr = new DOMParser();
    //stuff.log(unescape(stuff.tocxsl.replace(/&quot;/g,'"')));
    xsltp.importStylesheet(parsr.parseFromString(stuff.tocxsl.replace(/&quot;/g,'"'), 'text/xml'));
    var evo = document.createElement("br");
    var got_book_ev = new Event('got_book');
    function load_jsepub(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            stuff.log("Load input file");
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
                    stuff.log(msg);
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
            var contents = xsltp.transformToFragment(toc,doc);
            stuff.log(contents);
            //stuff.log(encod.utf8b2str( encod.str2utf8b(contents.textContent) ));
            return contents;
        }
    }
    return {
             load:function(file, lib) {
                        if(lib==='jsepub') load_jsepub(file);
             },
             get_page:function(index){
                     return get_indexed_page(index);
             },
             evo:evo
    }
}
);
