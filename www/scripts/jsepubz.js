define([], function () {
    var blob = null;//blob;
    var file = null;//file;
    var files = {};
    var b64blobs = {};
    var opfPath, container, mimetype, opf, toc=null;
    var notifier = null;
    var logger = function(text){console.log(text);};
    function extract_data(blob, index, array, callback, params, mtype){
        var reader = new FileReader();
        if(files[index]) console.warn("dublicated index "+index);
        if(reader.addEventListener){
            reader.addEventListener("loadend", function() {
                   array[index]=reader.result;
            //       console.log(index+" extracted as "+reader.result);
                   if(params[1]<params[0].length) callback(params);
                   else go_all();
                });
            if(mtype==='blob') reader.readAsDataURL(blob);
            else reader.readAsText(blob);
        } else {
            //console.warn(e.stack);
            reader.onload = function(e){
                    array[index]=reader.result;
              //      console.log(index+" extracted as "+reader.result);
                    if(params[1]<params[0].length) callback(params);
                    else go_all();
                }
            if(mtype==='blob') reader.readAsDataURL(blob);
            else reader.readAsText(blob);
        }
        delete reader;
    }
    function fill_files(data, name, callback, params){
        var re = /.+?\.(jpeg|jpg|gif|png|otf|ttf|bmp|wav)/i;
        params[1]++; //i
        if (re.test(name)){
            logger("extracting blob: " +name+"...");
            extract_data(data, name, b64blobs, callback, params, 'blob');
        } else {
            logger("extracting text: " +name+"...");
            extract_data(data, name, files, callback, params, 'text');
        }
        delete data;
    }
    function go_all(){
        console.log("go_all");
        container = files["META-INF/container.xml"];
        mimetype = files["mimetype"];
        didUncompressAllFiles(notifier);
    }

    function unzipBlob(notifier) {
        if(window.cordova){
            var exec = cordova.require('cordova/exec');
            crunzip = function(arr, callback) {
                exec(callback, function(err) {
                    console.log("Got error: '"+err+"' while exec unzip");
                }, "unzip", "unzip", arr);
            };
            var reader = new FileReader();
            reader.onload = function(evt){
                    var zblob = window.btoa(evt.target.result);
                    crunzip([zblob], function(itm){if(itm){
                                                       fill_files(window.atob(itm.data), itm.name, 
                                                                  function(nm){console.log(nm+" processed");}, itm.name);
                                                    } else {go_all();}}); 
                };
            reader.readAsBinaryString(file);
            //console.log("zblob=="+zblob);
        } else {
            var filenames = [];
            var datas = [];
            function getdatas(params){
                    var entries = params[0], i = params[1], reader = params[2];
                    filenames.push(entries[i].filename);
                    entries[i].getData(new zip.BlobWriter(), function (data) {
                            console.log("unzip "+i);
                            fill_files(data, filenames[i], getdatas, [entries, i, reader]);
                           // datas.push(data);
                            reader.close(function () {   });
                            i++;
                            //if(i<entries.length) getdatas(entries, i, reader);
                            //else go_all();
                        }, function(current, total) {
                            //logger("unzip "+current+" of total "+total);
                        });
        }
            zip.createReader(new zip.BlobReader(file), function (zipReader) {
                zipReader.getEntries(function (entries) {
                      getdatas([entries, 0, zipReader]);
                    });
            }, function(e){console.warn(e);});
        }

        return true;
    }
   function didUncompressAllFiles(notifier) {
        //try {
            notifier(3);
            opfPath = getOpfPathFromContainer();
            readOpf(files[opfPath]);

            notifier(4);
            postProcess();
            notifier(5); 
        //} catch(e) { console.warn(e);}
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
        //console.log(xml.replace(/opf\:metadata/gi, "metadata"));
        var doc = xmlDocument(xml.replace(/opf\:metadata/gi, "metadata"));
        opf = {
            metadata: {},
            manifest: {},
            spine: []
        };
        var metadatas = doc.getElementsByTagName("metadata")[0];
        //if(metadatas===undefined) metadatas = doc.getElementsByTagName("opf:metadata")[0];
        var metadataNodes = metadatas.childNodes;

        for (var i = 0, il = metadataNodes.length; i < il; i++) {
            var node = metadataNodes[i];
            // Skip text nodes (whitespace)
            if (node.nodeType === 3) { continue }

            var attrs = {};
            for (var i2 = 0, il2 = node.attributes.length; i2 < il2; i2++) {
                var attr = node.attributes[i2];
                attrs[attr.name] = attr.value;
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
        var tocre = /.+?\.ncx/i;
        var xml = '';
        for (var key in opf.manifest) {
            mediaType = opf.manifest[key]["media-type"];
            href = opf.manifest[key]["href"];
            result = undefined;
            if (mediaType === "text/css") {
                result = postProcessCSS(href);
            } else if( mediaType === "application/x-dtbncx+xml" || tocre.test(href)) {
                try {xml = decodeURIComponent(escape(files[href]));}
                catch(e) {xml = files[href]; console.warn(e.stack+"\n href == "+href);};
                toc = xmlDocument(xml);
            } else if (mediaType === "application/xhtml+xml") {
                //Do nothing
            } else { 
                console.log(href + " media type is " + mediaType);
            }

            if (result !== undefined) {
                files[href] = result;
            }
        }
        for (var key in opf.manifest) {
            mediaType = opf.manifest[key]["media-type"];
            href = opf.manifest[key]["href"];
            result = undefined;
            if (mediaType === "application/xhtml+xml") result = postProcessHTML(href); //After processing css
            if (result !== undefined) {
                files[href] = result;
            }
        }
    }

    function postProcessCSS(href) {
        var file = files[href];
        var self = this;
        var isformat = /url.*?format/;
        file = file.replace(/url\((.*?)\)/gi, function (str, url) {
            var format = '';
            if (/^data/i.test(url)) {
                // Don't replace data strings
                return str;
            } else {
                if(!isformat.test(url)){
                    if(/\.(otf$)/.test(url)) format = " format('opentype')";
                    if(/\.(ttf$)/.test(url)) format = " format('truetype')";
                    if(/\.(eot$)/.test(url)) format = " format('embedded-opentype')";
                }
                var dataUri = getDataUri(url, href);
                //console.log("In", href, ":", url,"->",dataUri);
                return "url('" + dataUri + "')"+format;
            }
        });
        //console.log(href, "->", file);
        return file;
    }
    function clean_tags(doc, tag){
            var tags = doc.getElementsByTagName(tag);
            for (var i = 0, il = tags.length; i < il; i++) {
                if(tags[i]){
                    var fragment = document.createDocumentFragment();
                    var ltag = tags[i];
                    while(ltag.firstChild) {
                        fragment.appendChild(ltag.firstChild);
                    }
                    ltag.parentNode.replaceChild(fragment, ltag);
                }
            }
            if (doc.getElementsByTagName(tag).length>0) clean_tags(doc, tag);
    }
    function postProcessHTML(href) {
        var xml = null;
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
        /*var styles = doc.getElementsByTagName("style");
        for (var i = 0, il = styles.length; i < il; i++) {
            var style = styles[i];
            var src = style.getAttribute("src");
            if (/^data/.test(src)) { continue }
            console.log("css src is: "+src);
            style.setAttribute("src", getDataUri(src, href));
        }*/
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
        clean_tags(doc, "head");
        clean_tags(doc, "body");
        clean_tags(doc, "meta");
        clean_tags(doc, "svg");
        clean_tags(doc, "script");
        //clean_tags(doc, "a");
        clean_tags(doc, "a");
        try { 
            var div = document.createElement('div');
            while(doc.firstChild) div.appendChild(doc.firstChild);
            clean_tags(div, "html");
            //delete doc;
            return div;
        } catch(e) { return doc; } 
        return doc;
    }

   function getDataUri(url, href) {
        var dataHref = resolvePath(url, href);
        var mediaType = findMediaTypeByHref(dataHref);
        if(b64blobs[dataHref]) return b64blobs[dataHref].replace(/data\:undefined|data\:application\/octet-stream/i, "data:"+mediaType);
        encodedData = escape(files[dataHref]);
        return "data:" + mediaType + "," + encodedData;
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
        var doc = new DOMParser().parseFromString(xml, "text/xml");

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
