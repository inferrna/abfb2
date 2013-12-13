define(
  ['require'],
  function(require){
    var fnmre = /(.*)?\/(.+)/;
    var options = null;
    var filere = /.*fb2|.*epub|.*txt/i;
    var badtext = "No any book on your SD card. You may try pick it by button above, or put books on SD card and reopen app.";
    function parse_storage_cr(sel, obj){
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady(){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
               fileSystem.root.getDirectory("Download", {
                       create: false
                   }, function(directory) {

                    var directoryReader = directory.createReader();
                    directoryReader.readEntries(function(entries) {
                        var i;
                        var count = 0;
                        for (i=0; i<entries.length; i++) {
                            if(filere.test(entries[i].name) && entries[i].isFile){
                                var nm  = document.createElement("option");
                                nm.textContent = entries[i].fullPath;
                                count++;
                                options.msg("File found: " + file.name);
                                sel.appendChild(nm);
                            }
                        }
                        if(count>0) {
                            obj.appendChild(sel);
                            options.msg(count+" files found on SD card");
                            options.get_opt('last_file', 
                                function(vl){ for(var i = 1; i < sel.options.length; i++){
                                                      var currentname = sel.options[i].value.replace(fnmre, "$2");
                                                      console.log("currentname == "+currentname+" vl == "+vl);
                                                      if(currentname === vl){
                                                          console.log("currentname == "+currentname+" == vl == "+vl);
                                                          sel.selectedIndex = i;
                                                          try { var evt = new Event('change');}
                                                          catch (e) { var evt = document.createEvent('Event'); evt.initEvent('change', true, true); }
                                                          sel.dispatchEvent(evt);
                                                      }
                                                  } }, null);
                        } else {
                            delete sel;
                            options.msg(badtext+" (err: "+err+")");
                        }

                    }, function (error) {
                        console.warn(error.code);
                    });

                   } );
            }, function(error) {
               alert("can't even get the file system: " + error.code);
            });
        }
    }
    function parse_storage_ff(sel, obj){
        var pics = navigator.getDeviceStorage('sdcard');
        // Let's browse all the images available
        var cursor = pics.enumerate();
        var count = 0;
        var slf = this;
        window.setTimeout(function(){slf.return}, 2048);
        cursor.onsuccess = function () {
            function g_or_b(err){
                if(count>0) {
                    obj.appendChild(sel);
                    options.msg(count+" files found on SD card");
                    options.get_opt('last_file', 
                        function(vl){ for(var i = 1; i < sel.options.length; i++){
                                              if(sel.options[i].value.replace(fnmre, "$2") === vl){
                                                  sel.selectedIndex = i;
                                                  try { var evt = new Event('change');}
                                                  catch (e) { var evt = document.createEvent('Event'); evt.initEvent('change', true, true); }
                                                  sel.dispatchEvent(evt);
                                              }
                                          } }, null);
                } else {
                    delete sel;
                    options.msg(badtext+" (err: "+err+")");
                }
            }
            if(this.result!=undefined) var file = this.result;
            else { 
                g_or_b("file undefined");
                return;
            }
            try{
                if(filere.test(file.name)){
                    var nm  = document.createElement("option");
                    nm.textContent = file.name;
                    count++;
                    options.msg("File found: " + file.name);
                    sel.appendChild(nm);
                }
            }catch(e) {
                g_or_b("unknown");
                return;
            }
            //alert("File found");
            // Once we found a file we check if there is other results
            if (!this.done) {
            // Then we move to the next result, which call the cursor
            // success with the next file as result.
                this.continue();
            } else {
                g_or_b("unknown");
                return;
            }
            //dict.get_dbs();
        }
        cursor.onerror = function () {
          console.warn("No file found "+this.error);
          options.msg(badtext);
        }
    }
    function get_ff(fnm, callback){
        var sdcard = navigator.getDeviceStorage('sdcard');
        var request = sdcard.get(fnm);
        request.onsuccess = function(){callback(this.result);};
        request.onerror = function () { console.warn("Unable to get the file: " + fnm + "got error: '\n    "+this.error); };
    }
    function get_cr(fnm, callback){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, null);
        function gotFS(fileSystem){fileSystem.root.getFile(fnm, null, gotFileEntry, null);}
        function gotFileEntry(fileEntry){fileEntry.file(gotFile, null);}
        function gotFile(file){callback(file);}
        function fail(error) { console.log("Unable to get the file: " + fnm + "got error: \n    "+JSON.stringify(error)); };
    }
    
    return {
             parse:function(sel, obj){
                     if(!options) options = require("options");
                     if(navigator.getDeviceStorage) parse_storage_ff(sel, obj);
                     else if(window.cordova) parse_storage_cr(sel, obj);

             },
             get:function(_fnm, callback){
                 var fnm = _fnm.replace("file://", "");
                 if(navigator.getDeviceStorage) get_ff(fnm, callback);
                 else if(window.cordova) if(LocalFileSystem) get_cr(fnm, callback);
             }
    }
  }
);
