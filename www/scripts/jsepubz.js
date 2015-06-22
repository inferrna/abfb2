define(['mimetypes', 'sharedf', 'sharedc'], 
function (mimetypes, sharedf, sharedc) {
    var blob = null;//blob;
    var file = null;//file;
    var zipreader = null;
    var gentries = null;
    var files = {};
    var b64blobs = {};
    var notifier = null;
    var fsthref = null;
    var opfPath = '';
    var opf = {};
    var container = null;
    var logger = function(text){console.log(text);};
    var srlzr = new XMLSerializer();
    var useCordova = !(window.Worker && window.Int8Array) && window.cordova;
    function extract_data(blob, index, array, callback, params, mtype){
        var reader = new FileReader();
        if(files[index]) console.warn("dublicated index "+index);
        if(reader.addEventListener){
            reader.addEventListener("loadend", function() {
                   array[index]=reader.result;
                   callback(params);
                });
        } else {
            reader.onload = function(e){
                    array[index]=reader.result;
                    callback(params);
                }
        }
        if(mtype==='blob') reader.readAsDataURL(blob);
        else{ 
            reader.readAsText(blob);
        }
        delete reader;
    }
    function fill_files(data, name, callback, params){
        params[1]++; //i++
        if (sharedf.reb.test(name)){
            logger("extracting blob: " +name+"...");
            extract_data(data, name, b64blobs, callback, params, 'blob');
        } else if (sharedf.ret.test(name)){
            logger("extracting text: " +name+"...");
            extract_data(data, name, files, callback, params, 'text');
        } else callback(params);
        delete data;
    }

    function unzipBlob(notifier) {
        if(useCordova){
            unzipFiles(["META-INF/container.xml", "mimetype"], proceedcontainer); 
        } else {
            zip.createReader(new zip.BlobReader(file), function (_zipReader) {
                zipreader = _zipReader;
                _zipReader.getEntries(function (entries) {
                      gentries = entries;
                      gentries.map(function(entr){files[entr.filename]='';});
                      unzipFiles(["META-INF/container.xml", "mimetype"], proceedcontainer); 
                    })
                });
        }
    }
    function proceedcontainer(){
        container = files["META-INF/container.xml"];
        opfPath = getOpfPathFromContainer(container);
        unzipFiles([opfPath], proceedopf);
    }
    function proceedopf(){
        console.log("call to read opf");
        readOpf(files[opfPath]);
        var staff2ext = [];
        var keyre = /^(ncx|toc)$/i;
        var tocre = /.+?\.ncx|toc\.xhtml|nav\.xhtml/i;
        for(var key in opf.manifest){
            var mediaType = opf.manifest[key]["media-type"];
            var href = opf.manifest[key]["href"];
            if(sharedf.reb.test(href) || mediaType==="text/css"
                || mediaType === "application/x-dtbncx+xml" || tocre.test(href) || keyre.test(key))
                staff2ext.push(opf.manifest[key]["href"]);
        }
        unzipFiles(staff2ext, proceedcss);
    }
    function parse_toc(toc, base){
       var tocels = [];
       var namerefs = {};
       function iterate_points(points){
           for(var i=0; i<points.length; i++){
               var tocel = {}
               var lbl = points[i].getElementsByTagName("navLabel")[0];
               var cont = points[i].getElementsByTagName("content")[0];
               tocel['href'] = resolvePath(cont.attributes['src'].value, base);
               tocel['name'] = lbl.textContent.replace(/\s+/mg, ' ');
               namerefs[tocel['href']] = tocel['name'];
               tocels.push(tocel)
           }
       }
       var points = toc.getElementsByTagName("navPoint");
       var points2 = toc.getElementsByTagName("pageTarget");
       iterate_points(points);
       iterate_points(points2);
       var recl = /toc-.+/i;
       var points = toc.getElementsByTagName("li");
       for(i=0; i<points.length; i++){
           var tocel = {}
           var a = points[i].getElementsByTagName("a")[0];
           tocel['href'] = resolvePath(a.getAttribute("href"), base);
           tocel['name'] = a.textContent.replace(/\s+/mg, ' ');
           namerefs[tocel['href']] = tocel['name'];
           tocels.push(tocel)
       }
       var number = 0;
       var lastname = '';
       //if(opf.guide.length){
           var newtocels = [];
           for(var _key in opf.guide){
               var key = resolvePath(_key, base); 
               var tocel = {};
               tocel['href'] = key;
               if(key in namerefs) {
                   tocel['name'] = namerefs[key];
                   lastname = namerefs[key];
                   number = 1;
               } else {
                   if(number > 0){
                       tocel['name'] = lastname.slice(0, 11)+'.. '+number+'.';
                       number+=1;
                   } else {
                       tocel['name'] = opf.guide[key];
                   }
               }
               newtocels.push(tocel)
           }
           if(newtocels.length > tocels.length) tocels = newtocels;
       //}
       delete namerefs, tocel;
       return tocels;
    }
    function proceedcss(){
        var oldtocre = /.+?\.ncx/i;
        var newtocre = /.*?(toc\.xhtml|nav\.xhtml)/i;
        var oldtocs = [];
        var newtocs = [];
        for(var key in opf.manifest){
                var mediaType = opf.manifest[key]["media-type"];
                var href = opf.manifest[key]["href"];
                var result = undefined;
                if (mediaType === "text/css") {
                    result = postProcessCSS(href);
                } else if (mediaType === "application/x-dtbncx+xml" || newtocre.test(href) || key==='toc') {
                    try {var xml = decodeURIComponent(escape(files[href]));}
                    catch(e) {var xml = files[href]; console.warn(e.stack+"\n href == "+href);};
                    newtocs.push([xmlDocument(xml), href]);
                } else if (oldtocre.test(href) || key==='ncx') {
                    try {xml = decodeURIComponent(escape(files[href]));}
                    catch(e) {xml = files[href]; console.warn(e.stack+"\n href == "+href);};
                    oldtocs.push([xmlDocument(xml), href]);
                }
                if (result !== undefined) {
                    files[href] = result;
                }
        }
        if(newtocs.length===1) eltoc=newtocs[0];
        else if(newtocs.length>1){
            eltoc=newtocs[0];
            for(var i=0; i<newtocs.length; i++){
                if(newtocs[i].firstChild && /html/i.test(newtocs[i].firstChild.tagName))
                    eltoc=newtocs[i];
            }
        }
        else if(oldtocs.length) var eltoc=oldtocs[0];
        toc = parse_toc(eltoc[0], eltoc[1]);
        sharedc.exec('bookng', 'got_toc')();
        var reincl = /(.{0,16}@import\s+?[\"\']?)(\w+?\.css)([\"\']?.{0,2}?;)/i;
        var fnm = href.replace(/(.+?\/)+(.*?\.css)/i, "$2");
        //2nd loop. css only.
        for (var key in opf.manifest){
            try {
                mediaType = opf.manifest[key]["media-type"];
                href = opf.manifest[key]["href"];
                result = undefined;
                if (mediaType === "text/css"){
                    var base = href.replace(fnm, "");
                    var importnames = [].concat(files[href].split(/\n/gi).filter(function(st){return reincl.test(st);}));
                    if(importnames.length){
                        var result = files[href];
                        for(var i=0; i<importnames.length; i++){
                            var incnm = base+importnames[i].replace(reincl, "$2");
                            var result = result.replace(importnames[i], files[incnm]);
                        }
                        files[href] = result;
                    }
                }
            } catch(e) {console.log("key is: "+key+"\nerror was:\n"+(e));}
        }
    }
    function proceedhtmlfst(href, clbk){
        unzipFiles([href], function(){
                clbk(postProcessHTML(href));
                delete files[href];
            });
    }

    function unzipFiles(filelist, extcallback) {
        if(useCordova){
            function fill_crdo(data, name){
                if (sharedf.reb.test(name)){
                    logger("extracting blob: " +name+"...");
                    b64blobs[name] = "data:"+mimetypes.getMimeType(name)+";base64,"+data;
                } else if (sharedf.ret.test(name)){
                    logger("extracting text: " +name+"...");
                    files[name] = window.atob(data);
                } else callback(params);
            }
            var exec = cordova.require('cordova/exec');
            crunzip = function(arr, callback) {
                exec(callback, function(err) {
                }, "unzip", "unzip", arr);
            };
            var reader = new FileReader();
            reader.onload = function(evt){
                    var zblob = window.btoa(evt.target.result);
                    crunzip([zblob, filelist], function(itm){if(!(itm.name==="END" && itm.data==="END")){
                                                       fill_crdo(itm.data, itm.name);
                                                    } else {extcallback();}}); 
                };
            reader.readAsBinaryString(file);
        } else {
            var filenames = [];
            var datas = [];
            function getdatas(params){
                if(params[1]>=params[0].length){ extcallback(); return; }
                var entries = params[0], i = params[1], reader = params[2];
                filenames.push(entries[i].filename);
                entries[i].getData(new zip.BlobWriter(), function (data) {
                        fill_files(data, filenames[i], getdatas, [entries, i, reader]);
                        i++;
                    }, function(current, total) {
                    });
            }
              var entriestg = gentries.filter(function(entr){return filelist.indexOf(entr.filename)>-1;});
              getdatas([entriestg, 0, zipreader]);
        }

        return true;
    }
   function didUncompressAllFiles(notifier) {
            notifier(3);
            opfPath = getOpfPathFromContainer(container);
            readOpf(files[opfPath]);

            notifier(4);
            postProcess();
            notifier(5); 
    }
        
        // For mockability
   function  withTimeout(func, notifier) {
        var self = this;
        setTimeout(function () {
            func.call(self, notifier);
        }, 30);
    }

    function getOpfPathFromContainer(container) {
        var doc = xmlDocument(container);
        return doc
            .getElementsByTagName("rootfile")[0]
            .getAttribute("full-path");
    }

    function readOpf(xml) {
        var doc = xmlDocument(xml.replace(/opf\:metadata/gi, "metadata"));
        opf = {
            metadata: {},
            manifest: {},
            spine: [],
            guide: {}
        };
        var metadatas = doc.getElementsByTagName("metadata")[0];
        var metadataNodes = metadatas.childNodes;

        for (var i = 0, il = metadataNodes.length; i < il; i++) {
            var node = metadataNodes[i];
            // Skip text nodes (whitespace)
            if (node.nodeType === 3) { continue }

            var attrs = {};
            if(node.attributes && node.attributes.length){
                for (var i2 = 0, il2 = node.attributes.length; i2 < il2; i2++) {
                    var attr = node.attributes[i2];
                    attrs[attr.name] = attr.value;
                }
            }
            attrs._text = node.textContent;
            opf.metadata[node.nodeName] = attrs;
        }

        var manifestEntries = doc
            .getElementsByTagName("manifest")[0]
            .getElementsByTagName("item");

        for (var i = 0, il = manifestEntries.length; i < il; i++) {
            var node = manifestEntries[i];
            opf.manifest[node.getAttribute("id")] = {
                "href": resolvePath(node.getAttribute("href"), opfPath),
                "media-type": node.getAttribute("media-type")
            }
        }

        var spineEntries = doc
            .getElementsByTagName("spine")[0]
            .getElementsByTagName("itemref");

        for (var i = 0, il = spineEntries.length; i < il; i++) {
            var node = spineEntries[i];
            opf.spine.push(node.getAttribute("idref"));
        }
        var guide = doc.getElementsByTagName("guide")[0];
        if(!guide) return;
        else var guideEntries = guide.getElementsByTagName("reference");

        for (var i = 0, il = guideEntries.length; i < il; i++) {
            var node = guideEntries[i];
            opf.guide[node.getAttribute("href")] = node.getAttribute("title");
        }
    }

    function resolvePath(path, referrerLocation) {
        var pathDirs = path.split("/");
        var fileName = pathDirs.pop();

        var locationDirs = referrerLocation.split("/");
        locationDirs.pop();

        for (var i = 0, il = pathDirs.length; i < il; i++) {
            var spec = pathDirs[i];
            if (spec === "..") {
                locationDirs.pop();
            } else {
                locationDirs.push(spec);
            }
        }

        locationDirs.push(fileName);
        return locationDirs.join("/");
    }

    function findMediaTypeByHref(href) {
        // Best guess if it's not in the manifest. (Those bastards.)
        var imgmatch = href.match(/\.(jpeg|jpg|gif|png|bmp)$/i);
        var matchttf = href.match(/\.(ttf)$/);
        var matchotf = href.match(/\.(otf)$/);
        if(imgmatch) return "image/" + match[1];
        else if(matchttf) return "font/ttf";
        else if(matchotf) return "font/otf";
        for (var key in opf.manifest) {
            var item = opf.manifest[key];
            if (item["href"] === href) {
                return item["media-type"];
            }
        }
        return "undefined";
    }

    function postProcessCSS(href) {
        var file = files[href];
        var self = this;
        file = file.replace(/url\([\'\"]?(.*?)[\'\"]?\)/gi, function (str, url) {
            var format = '';
            if (/^data/i.test(url)) {
                // Don't replace data strings
                return str;
            } else {
                var dataUri = getDataUri(url, href);
                if(/\.(otf$)/.test(url)) format = " format('opentype')";
                if(/\.(ttf$)/.test(url)) format = " format('truetype')";
                if(/\.(eot$)/.test(url)) format = " format('embedded-opentype')";
                if(/\.(woff$)/.test(url)) format = " format('woff')";
                return "url('" + dataUri + "')"+format+"\n";
            }
        });
        // 16px as 1em
        file = file.replace(/(font-size:\ ?)(\d+)(px)/gmi, function(match, p1, p2, p3, offset, string){return p1+Math.ceil(100*p2/16)/100+"em";});
        file = file.replace(/xx\-small/gi, '0.333em')
                   .replace(/x\-small/gi, '0.5em')
                   .replace(/small/gi, '0.75em')
                   .replace(/medium/gi, '1em')
                   .replace(/large/gi, '1.5em')
                   .replace(/x\-large/gi, '2em')
                   .replace(/xx\-large/gi, '3em');
        file = file.replace(/\n;/gi, ";");
        return file;
    }
    function extract_title(href){
        var xml = null;
        try{ xml = decodeURIComponent(escape(files[href]));}
        catch(e){xml = files[href];}
        var doc = xmlDocument(xml);
        if(!doc) return null;
        var title = doc.getElementsByTagName("header")[0] || doc.getElementsByTagName("title")[0] || doc.getElementsByTagName("h1")[0];
        if(!title) return null;
        return title.textContent;
    }
    function postProcessHTML(href) {
        var xml = null;
        if(sharedf.reb.test(href)) return "<img src="+getDataUri(href)+">";
        //console.log(files[href]);
        try{ xml = decodeURIComponent(escape(files[href]));}
        catch(e){xml = files[href];}
        var doc = xmlDocument(xml);
        var images = doc.getElementsByTagName("img");
        for (var i = 0, il = images.length; i < il; i++) {
            var image = images[i];
            var src = image.getAttribute("src");
            if (/^data/.test(src)) { continue }
            image.setAttribute("src", getDataUri(src, href));
        }
        images = doc.getElementsByTagName("image");
        for (var i = 0, il = images.length; i < il; i++) {
            var image = images[i];
            var src = image.getAttribute("xlink:href");
            if (/^data/.test(src)) { continue }
            image.removeAttribute("xlink:href");
            image.removeAttribute("xmlns");
            image.removeAttribute("width");
            image.removeAttribute("height");
            image.setAttribute("src", getDataUri(src, href))
        }
        var links = doc.getElementsByTagName("link");
        for (var i = 0, il = links.length; i < il; i++) {
            var link = links[i];
            if(link!==undefined)
            if (link.getAttribute("type") === "text/css") {
                var inlineStyle = document.createElement("style");
                inlineStyle.setAttribute("type", "text/css");
              //  inlineStyle.setAttribute("data-orig-href", link.getAttribute("href"));
                var csshref = resolvePath(link.getAttribute("href"), href);
                var css = files[csshref];
                if (inlineStyle.styleSheet){
                  inlineStyle.styleSheet.cssText = css;
                } else {
                  //var textNode = document.createTextNode(css);
                  //textNode.textContent = textNode.textContent.replace('&gt;', '>');
                  //data:"+mimetypes.getMimeType(name)+";base64,
                  inlineStyle.textContent = '@import'+' url(\''+'data:text/css;base64,'+window.btoa(css)+'\');';//.appendChild(textNode);
                }

                link.parentNode.replaceChild(inlineStyle, link);
            }
        }
        try{
            sharedf.clean_tags(doc, ["script", "a"]);
        }catch(e){console.log("postProcessHTML: clean tags failed"+e);}
        try { 
            //var div = document.createElement('div');
            //while(doc.firstChild) div.appendChild(doc.firstChild);
            var res = doc;//div;
            res.id = "epubcont";
            //delete doc;
        } catch(e) { var res = doc; }
        delete files[href];
        return srlzr.serializeToString(res);
    }

   function getDataUri(url, href) {
        if(href) var dataHref = resolvePath(url, href);
        else var dataHref = url;
        var mediaType = mimetypes.getMimeType(dataHref);
        var result = '';
        if(b64blobs[dataHref]) {
            result = b64blobs[dataHref].replace(/data\:undefined|data\:application\/octet-stream/i, "data:"+mediaType);
        } else { 
            result = "data:" + mediaType + "," + escape(files[dataHref]);
        }
        return result;
    }

    function validate() {
        if (container === undefined) {
            throw new Error("META-INF/container.xml file not found.");
        }

        if (mimetype === undefined) {
            throw new Error("Mimetype file not found.");
        }

        if (mimetype !== "application/epub+zip") {
            throw new Error("Incorrect mimetype " + mimetype);
        }
    }

    // for data URIs
    function escapeData(data) {
        return escape(data);
    }

    function xmlDocument(xml) {
        try{
            var doc = new DOMParser().parseFromString(xml, "text/xml");
        } catch(e) { console.warn("xml parse failed, got "+e.stack||e); }

        if (doc.childNodes[1] && doc.childNodes[1].nodeName === "parsererror") {
            throw doc.childNodes[1].childNodes[0].nodeValue;
        }
        return doc;
    }
    return {
        init: function(_file, _logger){
            file = _file;
            logger = _logger;
            sharedc.register('app', 'got_href', proceedhtmlfst);
            var blob = null;//blob;
            var file = null;//file;
            var zipreader = null;
            var gentries = null;
            var files = {};
            var b64blobs = {};
            var notifier = null;
            var fsthref = null;
            var toc = null;
            var opfPath, container, mimetype, opf, toc=null;
        },
        processInSteps: function(_file, _notifier, _logger){
            file = _file;
            logger = _logger;
            notifier = _notifier;
            unzipBlob(notifier);
        },
        get_by_href:function(href, clbk){
            proceedhtmlfst(href, clbk);
        },
        restore_titles:function(badtitles, clbk){
            var hrefs = [];
            for(key in badtitles) hrefs.push(badtitles[key]);
            unzipFiles(hrefs, function(){
                    clbk(hrefs.map(function(href){return extract_title(href);}));
                    hrefs.map(function(href){delete files[href];});
                });
        },
        toc:function(){return toc},
        opf:function(){return opf},
        files:function(){return files}
    }
}
);
