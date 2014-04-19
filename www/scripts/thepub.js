define(['jsepubz', 'stuff', 'encod', 'options', 'sharedf', 'sharedc'],
function(jsepub, stuff, encod, options, sharedf, sharedc){
    var marea = document.getElementById("maintext");
    var pageids = [];
    var pages = [];
    var anchors = {};
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
    function js_toc(toc, hrefs){
        //var doc = new DOMParser().parseFromString(xml, "text/xml");
       var div = document.createElement("div");
       var sel = document.createElement("select");
       sel.setAttribute("id", "tocselect");
       sel.style.width = "auto";
       var points = toc.getElementsByTagName("navPoint");
       var names = {};
       var name = '';
       var idx = '';
       var re1 = /(.+?)#(.*)/;
       var locanchors = {};
       function get_phrs(idxs){
           var phrs = {};
           idxs.map(function(hr){
                    phrs[hr] = idxs.filter(function(_hr){
                                return _hr ===  hr;
                        }).length;
               });
           return phrs;
       }
       var idxs = Array.prototype.slice.call(points)
                        .map(function(pt){ 
                                          return  pt.getElementsByTagName("content")[0]
                                                    .attributes['src'].value
                                                    .replace(sharedf.relf, "$2")
                                                    .replace(re1, "$1");});
       var purehrefs = get_phrs(idxs);
       for(i=0; i<points.length; i++){
           var lbl = points[i].getElementsByTagName("navLabel")[0];
           var cont = points[i].getElementsByTagName("content")[0];
           var href = cont.attributes['src'].value;
           idx = href.replace(sharedf.relf, "$2").replace(re1, "$1");
           name = lbl.textContent.replace(/\s+/mg, ' ');
           names[idx] = name;
           if(re1.test(href)) var anchor = href.replace(sharedf.relf, "$2").replace(re1, "$2");
           else anchor = null;
           if(anchor && purehrefs[idx]>1){
               if(!locanchors[idx]) locanchors[idx] = [];
               locanchors[idx].push([anchor, name]);
           }
       }
       var recl = /toc-.+/i;
       var points = toc.getElementsByTagName("li");
       var idxs = Array.prototype.slice.call(points)
                        .map(function(pt){ 
                                          return  pt.getElementsByTagName("a")[0]
                                                    .getAttribute("href")
                                                    .replace(sharedf.relf, "$2")
                                                    .replace(re1, "$1");});
       purehrefs = get_phrs(idxs);
       for(i=0; i<points.length; i++){
           var a = points[i].getElementsByTagName("a")[0];
           var href = a.getAttribute("href");
           idx = href.replace(sharedf.relf, "$2").replace(re1, "$1");
           if(a) name = a.textContent.replace(/\s+/mg, ' ');
           names[idx] = name;
           if(re1.test(href)) var anchor = href.replace(sharedf.relf, "$2").replace(re1, "$2");
           else anchor = null;
           if(anchor && purehrefs[idx]>1){
               if(!locanchors[idx]) locanchors[idx] = [];
               locanchors[idx].push([anchor, name]);
           }
       }
       var cnm = '';
       var j = 2;
       var k = 0;
       var badtitles = {};
       for(i=0; i<hrefs.length; i++){
           var opt = document.createElement("option");
           opt.style.textIndent = "32px";
           opt.setAttribute("id", k);
           opt.setAttribute('url', hrefs[i]);
           idx = hrefs[i].replace(sharedf.relf, "$2").replace(re1, "$1");
           opt.textContent = names[idx] || cnm+" - "+j;
           if(names[idx]){cnm = names[idx]; j = 2;}
           else {badtitles[i] = hrefs[i]; j++;}
           sel.appendChild(opt);
           if(locanchors[idx]){
               for(var c=0; c<locanchors[idx].length; c++){
                   k++;
                   var opt = document.createElement("option");
                   opt.style.textIndent = "32px";
                   opt.setAttribute("id", k);
                   opt.setAttribute('url', hrefs[i]);
                   anchors[k] = locanchors[idx][c][0];
                   opt.textContent = locanchors[idx][c][1] || names[idx]+" - "+(c+2) || cnm+" - "+j;
                   j++;
                   sel.appendChild(opt);
               }
           }
           k++;
       }
       div.appendChild(sel);
       epub.restore_titles(badtitles, function(titles){
                var sel = document.getElementById("tocselect");
                if(sel) var options = sel.getElementsByTagName("option");
                else return;
                if(!options) return;
                if(!options.length) return;
                var i = 0;
                for(key in badtitles){
                    var j = parseInt(key);
                    if(titles[i] && options[j]) options[j].textContent = titles[i];
                    i++;
                }
           });
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
                var idx = pages[index];
                if(idx >= opf.spine.length) idx = 0;
                var spine = opf.spine[idx];
                var href = opf.manifest[spine]["href"];
                if(anchors[index] && anchors[index]!="null") var anchor = anchors[index];
                else var anchor = null;
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
