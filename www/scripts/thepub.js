define(['jsepubz', 'stuff', 'encod', 'options', 'sharedf', 'sharedc'],
function(jsepub, stuff, encod, options, sharedf, sharedc){
    var marea = document.getElementById("maintext");
    var pageids = [];
    var pages = [];
    var anchors = {};
    var tocels = []
    var currentpage = 0;
    var oldhref = null;
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
            }
        return result;
    }
    function js_toc(tocels, hrefs){
       var div = document.createElement("div");
       var sel = document.createElement("select");
       sel.setAttribute("id", "tocselect");
       sel.style.width = "auto";
       for(i=0; i<tocels.length; i++){
           var opt = document.createElement("option");
           opt.style.textIndent = "32px";
           opt.setAttribute('id', i);
           opt.setAttribute('url', tocels[i]['href']);
           opt.textContent = tocels[i]['name'];
           sel.appendChild(opt);
       }
       div.appendChild(sel);
       return div;
    }
    //var evo = document.createElement("br");
    //var got_book_ev = new Event('got_book');
    function load_jsepub(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
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
    function get_indexed_page(index, percent){
        var opf = epub.opf();
        var toc = epub.toc();
        var files = epub.files();
        if(index>-1){
            if(opf && toc && files){
                var re1 = /(.+?)#(.*)/i;
                var href = toc[index]['href'].replace(re1, "$1");
                var anchor = toc[index]['href'].replace(re1, "$2").replace(toc[index]['href'], '');
                //var idx = pages[index];
                //var spine = opf.spine[idx];
                //var href = opf.manifest[spine]["href"];
                if(oldhref===href){
                    currentpage = index;
                    if(percent) sharedc.exec('bookng', 'got_fstfile')([null, anchor], percent);
                    else        sharedc.exec('bookng', 'got_fstfile')([null, anchor]);
                } else {
                    epub.get_by_href(href, function(html){
                            oldhref=href;
                            currentpage = index;
                            if(percent) sharedc.exec('bookng', 'got_fstfile')([html, anchor], percent);
                            else        sharedc.exec('bookng', 'got_fstfile')([html, anchor]);
                        });
                }
            } else return -1;
        }else{
            var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
            var hrefs   = [];
            var urls = [];
            var re1 = /(.+?)#(.*)/gi;
            var contents = js_toc(toc, opf.spine.map(function(sp){ return opf.manifest[sp]['href'];}));
            var hrefs = opf.spine.map(function(sp){ var fnm = opf.manifest[sp]['href'].replace(re1, "$1");
                                                    return fnm.replace(sharedf.relf, "$2");});
            var opts = contents.getElementsByTagName("option");
            urls = []; pages = [];
            for(var i = 0; i < opts.length; i++) {
                var url = opts[i].getAttribute('url');
                urls.push(url.replace(sharedf.relf, "$2").replace(re1, "$1"));
                //anchors.push(url.replace(sharedf.relf, "$2").replace(re1, "$2").replace(urls[i], null));
                var idx = hrefs.indexOf(urls[i]);
                if(idx>-1) pages.push(idx);
                else if(pages.length>1) pages.push(pages[pages.length-1]);
                else pages.push(0);
            }

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
                     return get_indexed_page(index);
             },
             render_all_pages:function(){
                 jsepub.init()
                 for(i=0; i<pages.length; i++){
                     //get_indexed_page(i);
                     //files = null;
                 }
             },
             option:function(i){
                     //if(i==0) return currentpage;
                     if(currentpage<pages.length) return currentpage;
                     return i;
             },
             get_fromopt:function(idx, prc){
                     var tidx = pages[idx];
                     if(tidx>-1 && !isNaN(tidx))
                        return get_indexed_page(idx, prc);
             },
             currentpage:function(){
                     return currentpage;
             },
             next_page:function(diff){
                    var page = currentpage + diff;
                    page = page>=pages.length ? 0 : page<0 ? pages.length-1 : page;
                    if(diff===-1) var prc='end';
                    else var prc = 0.0000001; //For examine if percent sended
                    return get_indexed_page(page, prc);
             },
             init:function(){
                     epub = null;
                     pages = [];
                     anchors = [];
                     currentpage = 0;
                     oldhref = null;
                     tocels = [];
             },
             get_href_byidx:function(index){
                var opf = epub.opf();
                if(opf){
                    var idx = index>-1 ? pages[index] : 0;
                    if(idx >= opf.spine.length) idx = 0;
                    else currentpage = index;
                    var spine = opf.spine[idx];
                    return opf.manifest[spine]["href"];
                }
             }
    }
}
);
