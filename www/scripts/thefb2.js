define(['stuff', 'sharedf', 'sharedc', 'cordova.js'],
function(stuff, sharedc, sharedf){
    var fb2 = document.createElement('div');//document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);//;
    //var evo = document.createElement("br");
    //var got_book_ev = new Event('got_book');
    var pages = [];
    var divs = [];
    var currentpage = 0;
    var srlzr = new XMLSerializer();
    var parsr = new DOMParser();
    var transavail = null;
    console.log("window.XSLTProcessor supports is "+(window.XSLTProcessor ? true : false));//NFP

    function ctransform(arr, callback){};
    try {
        var exec = cordova.require('cordova/exec');
        ctransform = function(arr, callback) {
            exec(callback, function(err) {
                console.log("Got error: '"+err+"' while exec transform");//NFP
                callback("");
            }, "XSLT", "transform", arr);
        };
        transavail = 'cordova';
    } catch(e) { console.log("No cordova transform available."); }

    function cordova_trans(xslt, xml, callback){
        ctransform([xslt, xml], function(string) {
            console.log("Got transformed:\n"+string);//NFP
            callback(parsr.parseFromString(string));
        });
    }

    var xsl = parsr.parseFromString(stuff.fb2xsl.replace(/&quot;/g,'"').replace(/&amp;/g,'\''), 'text/xml');
    if(window.XSLTProcessor){
        var xsltp = new XSLTProcessor();
        xsltp.importStylesheet(xsl);
    } else {
        //var jsxml = require('jsxml');
    }
    function transxsl(xmls, xsls, callback){
        if(window.XSLTProcessor) {
            var xml = parsr.parseFromString(xmls, 'text/xml');
            callback(xsltp.transformToFragment(xml, document));
        } else if(transavail==='cordova') cordova_trans(xsls, xmls, callback);
        else callback(parsr.parseFromString(jsxml.transReady(xmls, xsls), "text/html"));
    }


    function load_fb2(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");//NFP
            proceedfb2(evt.target.result);
        };
        Reader.readAsText(file);
    }
    function proceedfb2(fb2File){
        var serializer = new XMLSerializer();
        transxsl(fb2File, serializer.serializeToString(xsl), function(resultDocument){
            console.log("Got resultDocument == "+resultDocument);//NFP
            fb2.appendChild(resultDocument);
            //fb2 = resultDocument;
            var divlist = fb2.getElementsByTagName('div');
            var re = /TOC_.+/g;
            sharedf.clean_tags(fb2, ['script', 'a']);
            console.log("Tags cleaned");//NFP
            for(var i = 0; i < divlist.length; i++)
                if(re.test(divlist[i].getAttribute('id'))){ 
                    console.log("Push div id "+divlist[i].getAttribute('id'));//NFP
                    divs.push(divlist[i]);//.getAttribute('id'));
            } 
            sharedc.exec('book','got_book')();
            console.log("fb2 pages is "+pages);//NFP
        });
    }
    function clean_tags(doc, tag){
            var tags = doc.getElementsByTagName(tag);
            for (var i = 0, il = tags.length; i < il; i++) {
                var fragment = document.createDocumentFragment();
                var ltag = tags[i];
                if(ltag){
                    while(ltag.firstChild) {
                        fragment.appendChild(ltag.firstChild);
                    }
                    ltag.parentNode.replaceChild(fragment, ltag);
                }
            }
            if(doc.getElementsByTagName(tag).length>0) clean_tags(doc, tag);
    }
    function clean_invalid(doc){
        var invalids = Array.prototype.slice.call(doc.childNodes)
                       .filter(function(node){
                                    try{srlzr.serializeToString(node); return true;}
                                    catch (e) { console.warn(e); return false;}
                               });
    }
    function get_indexed_page(index){
        if(index>-1){
            var idx = pages[index];
            var ch = divs[idx];//document.getElementById(pages[index]);
            try { 
                var html = srlzr.serializeToString(ch);
            } catch (e) { console.warn(ch);
                clean_invalid(ch);
                return null;}
            return html;
        }else{
            var result = document.createElement('div');//document.createDocumentFragment();;//document.createElement('div');
            var toc = fb2.getElementsByTagName('select')[0].cloneNode(true);
            var options = fb2.getElementsByTagName('option');
            options[0].setAttribute('disabled', '');
            options[0].setAttribute('selected', '');
            var values = [];
            for(var i = 0; i<divs.length; i++)
                values.push(divs[i].getAttribute('id'));
            for(var i = 0; i<options.length; i++){
                var idx  = values.indexOf(options[i].getAttribute('did'));
                if(idx>-1) pages.push(idx);
                else if(pages.length>1) pages.push(pages[pages.length-1]);
                else pages.push(0);
            }
            toc.setAttribute('id', 'tocselect');
            result.appendChild(toc);
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
                     if(pages[currentpage]>-1 && !isNaN(pages[currentpage])) return currentpage;
                     return i;
             },
             get_fromopt:function(idx){
                     var tidx = pages[idx];
                     console.log("idx=="+idx+" tidx=="+tidx+" pages=="+pages);//NFP
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
                     /*var page = currentpage + diff;
                     if(pages.length>page && page>-1) {
                            currentpage += diff;
                            return get_indexed_page(currentpage);
                     }
                     return -1;*/
             },
             init:function(){
                    fb2 = document.createElement('div');//document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);//;
                    pages = [];
                    divs = [];
                    currentpage = 0;
             }
    }
}
);
