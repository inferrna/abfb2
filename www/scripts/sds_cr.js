define(
  ['require', 'sharedf'],
  function(require, sharedf){
    var options = null;
    var err = '';
    var filere = /.*\.fb2$|.*\.epub$|.*\.txt$/i;
    var badtext = "No any book on your SD card. You may try pick it by button above, or put books on SD card and reopen app.";
    var named_entries = {};
    function parse_storage_cr(sel, obj, callback){
        "use strict";
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady(){
            "use strict";
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
                                var fnm = entries[i].fullPath;//toURL();// 
                                nm.textContent = fnm;
                                named_entries[fnm] = entries[i];
                                count++;
                                options.msg("File found: " + entries[i].name+" url is: "+entries[i].toURL());
                                sel.appendChild(nm);
                            }
                        }
                        if(count>0) {
                            callback();
                        } else {
                            if(sel.parentNode) sel.parentNode.removeChild(sel);
                            options.msg(badtext+" (err: "+err+")");
                        }

                    }, function (error) {
                        console.warn("Can't parse directory:\n"+error.code);
                    });

                   } );
            }, function(error) {
               alert("can't even get the file system: " + error.code);
            });
        }
    }
    
    return {
             parse:function(sel, obj, clbk){
                 if(!options) options = require('options');
                 parse_storage_cr(sel, obj, clbk);
             },
             get:function(_fnm, callback){
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
