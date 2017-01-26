define(
  ['require', 'sharedf'],
  function(require, sharedf){
    console.log("sds_cr: init");
    var options = null;
    var err = '';
    var filere = /.*\.fb2$|.*\.epub$|.*\.txt$/i;
    var badtext = "No any book on your SD card. You may try pick it by button above, or put books on SD card and reopen app.";
    var named_entries = {};
    function parse_storage_cr(sel, obj, callback){
        "use strict";
        console.log("sds_cr: parse_storage_cr");
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady(){
            "use strict";
            console.log("sds_cr: fired onDeviceReady");
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
               console.log("sds_cr: fs requested");
               var permissions = cordova.plugins.permissions;
               permissions.hasPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);

               function checkPermissionCallback(status){
				  if(!status.hasPermission) {
					console.warn('File permission still not turned on');
					var errorCallback = function() {
					  console.warn('File permission turn on failed again');
					}
                    permissions.requestPermission(
                     permissions.READ_EXTERNAL_STORAGE,
                     function(status) {
                       if(!status.hasPermission) errorCallback();
                     },
                     errorCallback);
                  } else {
					 console.log('File permission turned on');
                  }
               }
               deepScan("file:///sdcard/Download", 0);
               var recCount = 0;
               function deepScan(dirUrl, level){
                   window.resolveLocalFileSystemURL(dirUrl,
                      function(directory) {

                        console.log("sds_cr: fs granted");
                        var directoryReader = directory.createReader();
                        directoryReader.readEntries(function(entries) {
                            var i;
                            var count = 0;
                            console.log("sds_cr: going to read entries");
                            for (i=0; i<entries.length; i++) {
                                console.log("sds_cr: got entry: "+entries[i].name);
                                if(filere.test(entries[i].name) && entries[i].isFile){
                                    var nm  = document.createElement("option");
                                    var fnm = entries[i].nativeURL; 
                                    nm.textContent = fnm;
                                    named_entries[fnm] = entries[i];
                                    count++;
                                    options.msg("File found: " + entries[i].name);
                                    sel.appendChild(nm);
                                } else if (entries[i].isDirectory){
                                    console.log("sds_cr: scan into "+entries[i].nativeURL);
                                    recCount++;
                                    deepScan(entries[i].nativeURL, level+1);
                                }
                            }
                            var namesTotal = Object.keys(named_entries);
                            console.log("sds_cr: found "+namesTotal.length+" valid files at the level "+level+" of deep scan");
                            if(namesTotal.length>0) callback(namesTotal);

                        }, function (error) {
                            console.log("Can't parse directory: "+error.code);
                        });

                       } );
            }
            }, function(error) {
               console.log("can't even get the file system: " + error.code);
            });
        }
    }
    
    return {
             parse:function(sel, obj, clbk){
                 console.log("sds_cr: call to parse");
                 if(!options) options = require('options');
                 parse_storage_cr(sel, obj, clbk);
             },
             get:function(_fnm, callback){
                 console.log("sds_cr: call to get");
                 var fnm = _fnm;//.replace("cdvfile://", "/");
                 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileEntry(named_entries[fnm]), fail);
                 /*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
                 function gotFS(fileSystem){
                        fileSystem.root.getFile("cdvfile://localhost/persistent"+fnm, null, gotFileEntry, fail);
                     }*/
                 function gotFileEntry(fileEntry){
                        fileEntry.file(gotFile, fail);
                     }
                 function gotFile(file){ 
                        callback(file);
                     }
                 function fail(error) { console.log("Unable to get the file: " + fnm + "\ngot error:\n"+JSON.stringify(error)); };
             }
    }
  }
);
