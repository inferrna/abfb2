define(['jsepubz', 'stuff', 'encod', 'options', 'sharedf', 'sharedc'],
function(jsepub, stuff, encod, options, sharedf, sharedc){
    var pages = [];
    var anchors = [];
    var currentpage = 0;
    var epub = null;
    var srlzr = new XMLSerializer();
    var parsr = new DOMParser();
    var xsl = parsr.parseFromString(stuff.tocxsl.replace(/&quot;/g,'"').replace(/&amp;/g,'\''), 'text/xml');
    if(window.XSLTProcessor){
        var xsltp = new XSLTProcessor();
        xsltp.importStylesheet(xsl, 'text/xml');
    } else {
        //var jsxml = require('jsxml');
    }
    function transxsl(xml, xsl, doc){
        var result = null;
        if(window.XSLTProcessor)
            try {result = xsltp.transformToDocument(xml, doc);}
            catch(e){
                console.log(e.stack);//NFP
            }
        return result;
    }
    function js_toc(toc, files){
        //var doc = new DOMParser().parseFromString(xml, "text/xml");
       var div = document.createElement("div");
       var sel = document.createElement("select");
       sel.setAttribute("id", "tocselect");
       sel.style.width = "auto";
       console.log("toc:");
       console.log(toc);
       var points = toc.getElementsByTagName("navPoint");
       for(i=0; i<points.length; i++){
           var lbl = points[i].getElementsByTagName("navLabel")[0];
           var cont = points[i].getElementsByTagName("content")[0];
           console.log("points["+i+"].id=="+points[i].id+" lbl.text=="+lbl.textContent.replace(/\s+/mg, ' ')+" cont.src=="+cont.attributes['src'].value);//NFP
           var opt = document.createElement("option");
           opt.style.textIndent = "32px";
           var order = points[i].attributes['playOrder'] ? points[i].attributes['playOrder'].value : i; 
           opt.setAttribute("id", order);
           opt.setAttribute('url', cont.attributes['src'].value);
           opt.textContent = lbl.textContent.replace(/\s+/mg, ' ');
           sel.appendChild(opt);
       }
       var recl = /toc-.+/i;
       var points = toc.getElementsByTagName("li");
       var keys = Object.keys(files).map(function(key){return key.replace(/(.*)?\/(.+)/i, "$2");});
       console.log("files keys:");//NFP
       console.log(keys);
       for(i=0; i<points.length; i++){
           var a = points[i].getElementsByTagName("a")[0];
           if(a){
               var opt = document.createElement("option");
               opt.style.textIndent = "32px";
               opt.setAttribute("id", ""+i);
               opt.setAttribute('url', a.getAttribute("href"));
               opt.textContent = a.textContent.replace(/\s+/mg, ' ');
               sel.appendChild(opt);
           }
       }
       div.appendChild(sel);
       return div;
    }
    //var evo = document.createElement("br");
    //var got_book_ev = new Event('got_book');
    function load_jsepub(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");//NFP
            proceedepub(evt.target.result, file);
        };
        Reader.readAsBinaryString(file);
    }
    function proceedepub(epubFile, file){
        // Use HTML5 files or download via XHR.
        //epub = new JSEpub(epubFile, file);
        epub = jsepub;
        epub.init();
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
                    console.log(msg);//NFP
                    sharedc.exec('book', 'got_book')();
                }
                // Render the "msg" here.
            }, options.msg);
    }
    function get_true_id(url, id, text){
        for(var i = 0; i<epub.opf.spine.length;i++){
            var spine = epub.opf.spine[i];
            var href = epub.opf.manifest[spine]["href"];
            if(href===url) {
                return i+1;
            }
        }
        console.warn(url+" not found");
        return id;
    }
    function get_indexed_page(index){
        var opf = epub.opf();
        var toc = epub.toc();
        var files = epub.files();
        console.log("calling index "+index+"; opf:");//NFP
        console.log(opf);//NFP
        if(index>-1){
            console.log("files:");//NFP
            console.log(files);//NFP
            if(opf && toc && files){
                var idx = pages[index];
                console.log("idx= "+idx+ "; anchor="+anchors[index]);//NFP
                if(idx >= opf.spine.length) idx = 0;
                var spine = opf.spine[idx];
                var href = opf.manifest[spine]["href"];
                console.log("idx= "+idx+ "; href="+href);//NFP
                var doc = files[href];
                if(anchors[index] && anchors[index]!="null") var anchor = anchors[index];
                else var anchor = null;
                var html = srlzr.serializeToString(doc);
                return [html, anchor];
            } else { return null; }
        }else{
            var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
            var contents = transxsl(toc, xsl, doc);//xsltp.transformToDocument(toc,doc);
            if(!contents || !contents.getElementsByTagName || contents.id!=="tocselect") contents = js_toc(toc, files);
            var opts = contents.getElementsByTagName("option");
            var hrefs   = [];
            var urls = [];
            var re1 = /(.+?)#(.*)/gi;
            var hrefs = opf.spine.map(function(sp){ var fnm = opf.manifest[sp]['href'].replace(re1, "$1");
                                                    return fnm.replace(sharedf.relf, "$2");});
            console.log("hrefs:");//NFP
            console.log(hrefs);//NFP
            anchors = []; urls = [];
            for(var i = 0; i < opts.length; i++) {
                var url = opts[i].getAttribute('url');
                urls.push(url.replace(sharedf.relf, "$2").replace(re1, "$1"));
                anchors.push(url.replace(sharedf.relf, "$2").replace(re1, "$2").replace(urls[i], null));
                var idx = hrefs.indexOf(urls[i]);
                if(idx>-1) pages.push(idx);
                else if(pages.length>1) pages.push(pages[pages.length-1]);
                else pages.push(0);
            }
            console.log("urls:");//NFP
            console.log(urls);//NFP
            console.log("anchors:");//NFP
            console.log(anchors);//NFP

            for(var i = 0; i<opf.spine.length;i++){
                var spine = opf.spine[i];
                opf.manifest[spine]['href'] = opf.manifest[spine]['href'].replace(re1, "$1");
            }
            var docFragment = document.createDocumentFragment();
            while(contents.firstChild) docFragment.appendChild(contents.firstChild);
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
                     anchors = [];
                     currentpage = 0;
             },
             get_href_byidx:function(index){
                var opf = epub.opf();
                console.log("calling href by index "+index+"; opf:");//NFP
                console.log(opf);//NFP
                if(opf && index>-1){
                    var idx = pages[index];
                    console.log("idx= "+idx+ "; pages="+pages);//NFP
                    if(idx >= opf.spine.length) idx = 0;
                    var spine = opf.spine[idx];
                    return opf.manifest[spine]["href"];
                }
             }
    }
}
);
