define(['jsepubz', 'stuff', 'encod', 'options'],
function(jsepub, stuff, encod, options){
    var epub = null;
    var srlzr = new XMLSerializer();
    var xsltp = new XSLTProcessor();
    var parsr = new DOMParser();
    //console.log(unescape(stuff.tocxsl.replace(/&quot;/g,'"')));
    xsltp.importStylesheet(parsr.parseFromString(stuff.tocxsl.replace(/&quot;/g,'"').replace(/&amp;/g,'\''), 'text/xml'));
    //var evo = document.createElement("br");
    //var got_book_ev = new Event('got_book');
    var callbacks = { 'got_book':function(){} };
    var pages = [];
    var currentpage = 0;
    function load_jsepub(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");
            proceedepub(evt.target.result, file);
        };
        Reader.readAsBinaryString(file);
    }
    function proceedepub(epubFile, file){
        // Use HTML5 files or download via XHR.
        //epub = new JSEpub(epubFile, file);
        epub = jsepub;
        epub.processInSteps(file, function (step, extras) {
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
                    callbacks['got_book']();
                }
                // Render the "msg" here.
            }, options.msg);
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
        console.warn(url+" not found");
        return id;
    }
    function get_indexed_page(index){
        //console.log("get_indexed_page "+index);
        var opf = epub.opf();
        var toc = epub.toc();
        var files = epub.files();
        if(index>-1){
            //console.log("index=="+index+"  spine=="+spine+"\n"+JSON.stringify(opf.manifest));
            if(opf && toc && files){
                if(index >= opf.spine.length) index = 0;
                var spine = opf.spine[index];
                var href = opf.manifest[spine]["href"];
                var doc = files[href];
                var html = srlzr.serializeToString(doc);
                options.set_opt("last_html", html);
                return html;//decodeURIComponent( escape(resultDocument) ));
            } else { return null; }
        }else{
            var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
            var contents = xsltp.transformToDocument(toc,doc);
            var opts = contents.getElementsByTagName("option");

            var hrefs = [];
            var urls = [];
            var re = /([\w\/]+)\/(.*)/;
            for(var i = 0; i < opts.length; i++) {
                urls.push(opts[i].getAttribute('url').replace(re, "$2"));
            }
            //console.log("urls is "+urls);
            for(var i = 0; i<opf.spine.length;i++){
                var spine = opf.spine[i];
                href = opf.manifest[spine]['href'].replace(re, "$2");
                //console.log(i+" href "+href+" "+opf.manifest[spine]['href']);
                var idx = urls.indexOf(href);
                pages.push(idx);
            }
            //console.log("pages is "+pages);
            var docFragment = document.createDocumentFragment();
            while(contents.firstChild) docFragment.appendChild(contents.firstChild);
            //console.log(encod.utf8b2str( encod.str2utf8b(contents.textContent) ));
            return docFragment;//contents;
        }
    }
    function get_true_opt(idx){
        if(idx<=0) return 0;
        if(pages[idx]>-1) return pages[idx];
        else return get_true_opt(idx-1);
    }

    return {
             load:function(file, lib) {
                     if(lib==='jsepub') load_jsepub(file);
             },
             get_page:function(index){
                     currentpage = index;
                     return get_indexed_page(index);
             },
             option:function(i){
                     if(i==0) return get_true_opt(currentpage+0);
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
                     //console.log(currentpage+" next_page "+diff);
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
             add_callback:function(key, fcn){
                    callbacks[key] = fcn;
             }
    }
}
);
