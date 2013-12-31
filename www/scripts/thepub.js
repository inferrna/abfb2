define(['jsepubz', 'stuff', 'encod', 'options'],
function(jsepub, stuff, encod, options){
    var epub = null;
    var srlzr = new XMLSerializer();
    var parsr = new DOMParser();
    //console.log(unescape(stuff.tocxsl.replace(/&quot;/g,'"')));
    //xsltp.importStylesheet(parsr.parseFromString(stuff.tocxsl.replace(/&quot;/g,'"').replace(/&amp;/g,'\''), 'text/xml'));
    var xsl = parsr.parseFromString(stuff.tocxsl.replace(/&quot;/g,'"').replace(/&amp;/g,'\''), 'text/xml');
    if(window.XSLTProcessor){
        var xsltp = new XSLTProcessor();
        xsltp.importStylesheet(xsl, 'text/xml');
    } else {
        //var jsxml = require('jsxml');
    }
    function transxsl(xml, xsl, doc){
        if(window.XSLTProcessor) return xsltp.transformToDocument(xml, doc);
        else return parsr.parseFromString(jsxml.transReady(xml, xsl), "text/html");
    }
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
            if(opf && toc && files){
                var idx = pages[index];
                //console.log("pages=="+pages+" idx=="+idx+" index=="+index);
                if(idx >= opf.spine.length) idx = 0;
                var spine = opf.spine[idx];
                var href = opf.manifest[spine]["href"];
                var doc = files[href];
                //console.log("href: "+href);
                var html = srlzr.serializeToString(doc);
                options.set_opt("last_html", html, true);
                return html;//decodeURIComponent( escape(resultDocument) ));
            } else { return null; }
        }else{
            var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
            var contents = transxsl(toc, xsl, doc);//xsltp.transformToDocument(toc,doc);
            var opts = contents.getElementsByTagName("option");

            var hrefs = [];
            var urls = [];
            var re = /(.*\/)+?(.+?)/;
            var re1 = /(.+?)(#.*)/;
            var hrefs = opf.spine.map(function(sp){return opf.manifest[sp]['href'].replace(re, "$2").replace(re1, "$1");});
            for(var i = 0; i < opts.length; i++) {
                urls.push(opts[i].getAttribute('url').replace(re, "$2").replace(re1, "$1"));
                var idx = hrefs.indexOf(urls[i]);
                //console.log("Got url: "+opts[i].getAttribute('url')+" -> "+urls[i]+". idx=="+idx+", hrefs[idx]=="+hrefs[idx]);
                if(idx>-1) pages.push(idx);
                else if(pages.length>1) pages.push(pages[pages.length-1]);
                else pages.push(0);
            }
            //console.log("urls is "+urls+" opf.spine.length=="+opf.spine.length);
            for(var i = 0; i<opf.spine.length;i++){
                var spine = opf.spine[i];
                opf.manifest[spine]['href'] = opf.manifest[spine]['href'].replace(re1, "$1");
            }
            //console.log("hrefs is "+hrefs);
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
                     //console.log("i=="+i+" currentpage=="+currentpage+" pages[currentpage]=="+pages[currentpage])
                     //if(i==0) return currentpage;
                     if(pages[currentpage]>-1 && !isNaN(pages[currentpage])) return currentpage;
                     return i;
             },
             get_fromopt:function(idx){
                     var tidx = pages[idx];
                     if(tidx>-1 && !isNaN(tidx)) currentpage = idx;
                     return get_indexed_page(currentpage);
             },
             currentpage:function(){
                     return currentpage;
             },
             next_page:function(diff){
                     //console.log(currentpage+" next_page "+diff);
                     var page = pages.indexOf(pages[currentpage] + diff);
                     if(page>-1) {
                            currentpage = page;
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
