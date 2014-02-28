define(['mimetypes', 'sharedf', 'sharedc'], 
function (mimetypes, sharedf, sharedc) {
    var blob = null;//blob;
    var file = null;//file;
    var files = {};
    var b64blobs = {};
    var opfPath, container, mimetype, opf, toc=null;
    var notifier = null;
    var logger = function(text){console.log(text);};
    sharedc.register('app', 'got_href', proceedhtmlfst);
    function extract_data(blob, index, array, callback, params, mtype){
        var reader = new FileReader();
        console.log("Extracting "+index);//NFP
        if(files[index]) console.warn("dublicated index "+index);
        if(reader.addEventListener){
            reader.addEventListener("loadend", function() {
                   array[index]=reader.result;
                   callback(params);
                });
            if(mtype==='blob') reader.readAsDataURL(blob);
            else reader.readAsText(blob);
        } else {
            reader.onload = function(e){
                    array[index]=reader.result;
                    callback(params);
                }
            if(mtype==='blob') reader.readAsDataURL(blob);
            else reader.readAsText(blob);
        }
        delete reader;
    }
    function fill_files(data, name, callback, params){
        params[1]++; //i++
        console.log("Got: "+name+" binary ? "+sharedf.reb.test(name)+"; text ? "+sharedf.ret.test(name));//NFP
        if (sharedf.reb.test(name)){
            logger("extracting blob: " +name+"...");
            extract_data(data, name, b64blobs, callback, params, 'blob');
        } else if (sharedf.ret.test(name)){
            logger("extracting text: " +name+"...");
            extract_data(data, name, files, callback, params, 'text');
        } else callback(params);
        delete data;
    }
    function go_all(){
        console.log("go_all");//NFP
        container = files["META-INF/container.xml"];
        mimetype = files["mimetype"];
        didUncompressAllFiles(notifier);
    }

    function unzipBlob(notifier) {
        zip.createReader(new zip.BlobReader(file), function (zipReader) {
            zipReader.getEntries(function (entries) {
                  entries.map(function(entr){files[entr.filename]=null;});
                  unzipFiles(["META-INF/container.xml", "mimetype"], proceedcontainer); 
                })
            });
    }
    function proceedcontainer(){
        container = files["META-INF/container.xml"];
        opfPath = getOpfPathFromContainer();
        unzipFiles([opfPath], proceedopf);
    }
    function proceedopf(){
        readOpf(files[opfPath]);
        var staff2ext = [];
        //sharedf.reb.test(name);
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
    function proceedcss(){
        var keyre = /^(ncx|toc)$/i;
        var tocre = /.+?\.ncx|toc\.xhtml|nav\.xhtml/i;
        for(var key in opf.manifest){
            try {
                var mediaType = opf.manifest[key]["media-type"];
                var href = opf.manifest[key]["href"];
                var result = undefined;
                if (mediaType === "text/css") {
                    result = postProcessCSS(href);
                } else if( mediaType === "application/x-dtbncx+xml" || tocre.test(href) || keyre.test(key)) {
                    console.log("toc href=="+href);//NFP
                    try {xml = decodeURIComponent(escape(files[href]));}
                    catch(e) {xml = files[href]; console.warn(e.stack+"\n href == "+href);};
                    toc = xmlDocument(xml);
                    sharedc.exec('jsepubz', 'got_toc')();
                }
                if (result !== undefined) {
                    console.log(href + " media type is " + mediaType + " addedd ok");//NFP
                    files[href] = result;
                }
            } catch(e) { console.log("key is: "+key+"\nerror was:\n"+(e)); }
        }
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
                            console.log("css)"+href + " includes "+incnm);//NFP
                            var result = result.replace(importnames[i], files[incnm]);
                        }
                        files[href] = result;
                    }
                }
            } catch(e) {console.log("key is: "+key+"\nerror was:\n"+(e));}
        }
    }
    function proceedhtmlfst(href){
        unzipFiles([href], proceedhtmloth);
    }
    function proceedhtmloth(){
        var htmls2ext = [];
        for (var key in opf.manifest) {
            try {
                mediaType = opf.manifest[key]["media-type"];
                href = opf.manifest[key]["href"];
                if (mediaType === "application/xhtml+xml") htmls2ext.push(href); //After processing css
            } catch(e) {console.log("key is: "+key+"\nerror was:\n"+(e));}
        }
        unzipFiles(htmls2ext, function(){});
    }

    function unzipFiles(filelist, extcallback) {
        if(window.cordova){
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
                    console.log("Got error: '"+err+"' while exec unzip");//NFP
                }, "unzip", "unzip", arr);
            };
            var reader = new FileReader();
            reader.onload = function(evt){
                    var zblob = window.btoa(evt.target.result);
                    crunzip([zblob], function(itm){if(!(itm.name==="END" && itm.data==="END")){
                                                       fill_crdo(itm.data, itm.name);
                                                    } else {extcallback();}}); 
                };
            reader.readAsBinaryString(file);
        } else {
            var filenames = [];
            var datas = [];
            function getdatas(params){
                console.log("entries.length=="+params[0].length);//NFP
                if(params[1]>=params[0].length){ extcallback(); return; }
                var entries = params[0], i = params[1], reader = params[2];
                filenames.push(entries[i].filename);
                files[entries[i].filename] = null;
                entries[i].getData(new zip.BlobWriter(), function (data) {
                        console.log("unzip "+i);//NFP
                        fill_files(data, filenames[i], getdatas, [entries, i, reader]);
                        reader.close(function () {   });
                        i++;
                    }, function(current, total) {
                    });
            }
            zip.createReader(new zip.BlobReader(file), function (zipReader) {
                zipReader.getEntries(function (entries) {
                      getdatas([entries.filter(function(entr){return filelist.indexOf(entr.filename)>-1;}), 0, zipReader]);
                    });
            }, function(e){console.warn(e);});
        }

        return true;
    }
   function didUncompressAllFiles(notifier) {
            notifier(3);
            opfPath = getOpfPathFromContainer();
            console.log("opfPath=="+opfPath);//NFP
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

    function getOpfPathFromContainer() {
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
            spine: []
        };
        var metadatas = doc.getElementsByTagName("metadata")[0];
        console.log("readOpf doc:");//NFP
        console.log(doc);//NFP
        console.log("readOpf metadatas:");//NFP
        console.log(metadatas);//NFP
        var metadataNodes = metadatas.childNodes;
        console.log("readOpf metadatas.childNodes:");//NFP
        console.log(metadatas.childNodes);//NFP

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
        var match = href.match(/\.(jpeg|jpg|gif|png|bmp)$/i);
        var matchttf = href.match(/\.(ttf)$/);
        var matchotf = href.match(/\.(otf)$/);
        if(match) return "image/" + match[1];
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

    // Will modify all HTML and CSS files in place.
    function postProcess() {
        var mediaType = '';
        var href = '';
        var result = '';
        var keyre = /ncx|toc/i;
        var tocre = /.+?\.ncx|toc\.xhtml|nav\.xhtml/i;
        var xml = '';
        var keys = Object.keys(opf.manifest);
        console.log("postProcess opf.manifest:\n"+JSON.stringify(keys));//NFP
        var key;
        //First loop. All exept binary data and html.
        for (var _key in keys) {
            key = keys[_key];
            try {
                mediaType = opf.manifest[key]["media-type"];
                //console.log(key+":");
                //console.log(opf.manifest[key]);//NFP
                href = opf.manifest[key]["href"];
                result = undefined;
                if (mediaType === "text/css") {
                    result = postProcessCSS(href);
                } else if( mediaType === "application/x-dtbncx+xml" || tocre.test(href) || keyre.test(key)) {
                    console.log("toc href== "+href);//NFP
                    try {xml = decodeURIComponent(escape(files[href]));}
                    catch(e) {xml = files[href]; console.warn(e.stack+"\n href == "+href);};
                    toc = xmlDocument(xml);
                    sharedc.exec('jsepubz', 'got_toc')();
                } else if (mediaType === "application/xhtml+xml") {
                    //Do nothing
                } else { 
                    console.log(href + " media type is " + mediaType);//NFP
                }
                if (result !== undefined) {
                    console.log(href + " media type is " + mediaType + " addedd ok");//NFP
                    files[href] = result;
                }
            } catch(e) { console.log("key is: "+key+"\nerror was:\n"+(e)); }
        }
        //2nd loop. css only.
        for (var _key in keys) {
            key = keys[_key];
            try {
                mediaType = opf.manifest[key]["media-type"];
                href = opf.manifest[key]["href"];
                result = undefined;
                if (mediaType === "text/css"){
                    var fnm = href.replace(/(.+?\/)+(.*?\.css)/i, "$2");
                    var base = href.replace(fnm, "");
                    var reincl = /(.{0,16}@import\s+?[\"\']?)(\w+?\.css)([\"\']?.{0,2}?;)/i;
                    var importnames = [].concat(files[href].split(/\n/gi).filter(function(st){return reincl.test(st);}));
                    if(importnames.length){
                        var result = files[href];
                        for(var i=0; i<importnames.length; i++){
                            var incnm = base+importnames[i].replace(reincl, "$2");
                            console.log("css)"+href + " includes "+incnm);//NFP
                            var result = result.replace(importnames[i], files[incnm]);
                        }
                        files[href] = result;
                        console.log("result:");
                        console.log(result);
                    }
                }
                if (result !== undefined){
                }
            } catch(e) {console.log("key is: "+key+"\nerror was:\n"+(e));}
        }
        //3rd loop. html only.
        for (var _key in keys) {
            key = keys[_key];
            try {
                mediaType = opf.manifest[key]["media-type"];
                href = opf.manifest[key]["href"];
                console.log("2nd)"+href + " media type is " + mediaType+" file exists: "+(files[href]?true:false));//NFP
                result = undefined;
                if (mediaType === "application/xhtml+xml") result = postProcessHTML(href); //After processing css
                if (result !== undefined) {
                    console.log(href + " media type is " + mediaType + " addedd ok");//NFP
                    delete files[href];
                    files[href] = result;
                }
            } catch(e) {console.log("key is: "+key+"\nerror was:\n"+(e));}
        }
    }

    function postProcessCSS(href) {
        var file = files[href];
        var self = this;
        //var isformat = /url.*?format.+?/gi;
        file = file.replace(/url\((.*?)\)/gi, function (str, url) {
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
                return "url('" + dataUri + "')"+format;
            }
        });
        return file;
    }
    function postProcessHTML(href) {
        var xml = null;
        try{ xml = decodeURIComponent(escape(files[href]));}
        catch(e){xml = files[href];}
        var doc = xmlDocument(xml);
        console.log("postProcessHTML "+href+"\n doc=="+doc+"\n xml=="+xml.slice(0,128));//NFP
        var images = doc.getElementsByTagName("img");
        for (var i = 0, il = images.length; i < il; i++) {
            var image = images[i];
            var src = image.getAttribute("src");
            if (/^data/.test(src)) { continue }
            image.setAttribute("src", getDataUri(src, href));
        }
        console.log("postProcessHTML: images done - 1");//NFP
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
        console.log("postProcessHTML: images done - 2");//NFP
        //var head = doc.getElementsByTagName("head")[0];
        var links = doc.getElementsByTagName("link");
        for (var i = 0, il = links.length; i < il; i++) {
            var link = links[i];
            if(link!==undefined)
            if (link.getAttribute("type") === "text/css") {
                var inlineStyle = document.createElement("style");
                inlineStyle.setAttribute("type", "text/css");
                inlineStyle.setAttribute("data-orig-href", link.getAttribute("href"));

                var css = files[resolvePath(link.getAttribute("href"), href)];
                //css = css.replace(/\(\.\.\//g, "(");
                inlineStyle.appendChild(document.createTextNode(css));

                link.parentNode.replaceChild(inlineStyle, link);
            }
        }
        console.log("postProcessHTML: links done");//NFP
        try{
            sharedf.clean_tags(doc, ["head", "body", "meta", "svg", "script", "a"]);
            console.log("postProcessHTML: clean tags done");//NFP
        }catch(e){console.log("postProcessHTML: clean tags failed"+e);}
        try { 
            var div = document.createElement('div');
            while(doc.firstChild) div.appendChild(doc.firstChild);
            sharedf.clean_tags(div, ["html"]);
            //delete doc;
            return div;
        } catch(e) { return doc; } 
        return doc;
    }

   function getDataUri(url, href) {
        var dataHref = resolvePath(url, href);
        var mediaType = mimetypes.getMimeType(dataHref);
        var result = '';
        if(b64blobs[dataHref]) {
            result = b64blobs[dataHref].replace(/data\:undefined|data\:application\/octet-stream/i, "data:"+mediaType);
            delete b64blobs[dataHref];
        } else { 
            result = "data:" + mediaType + "," + escape(files[dataHref]);
            delete files[dataHref];
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
        },
        processInSteps: function(_file, _notifier, _logger){
            file = _file;
            logger = _logger;
            notifier = _notifier;
            unzipBlob(notifier);
        },
        toc:function(){return toc},
        opf:function(){return opf},
        files:function(){return files}
    }
}
);
