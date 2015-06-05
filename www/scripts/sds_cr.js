define(
  ['require', 'sharedf'],
  function(require, sharedf){
    var options = null;
    var err = '';
    var filere = /.*fb2|.*epub|.*txt/i;
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
                                console.log("File found: " + entries[i].name+" url is: "+entries[i].toURL());//NFP
                                sel.appendChild(nm);
                            }
                        }
                        if(count>0) {
                            obj.appendChild(sel);
                            callback();
                            options.msg(count+" files found on SD card");
                            options.get_opt('last_file', 
                                function(vl){ for(var i = 1; i < sel.options.length; i++){
                                                      var currentname = sel.options[i].value.replace(sharedf.relf, "$2");
                                                      if(currentname === vl){
                                                          console.log("File "+currentname+" found");//NFP
                                                          sel.selectedIndex = i;
                                                          try { var evt = new Event('change');}
                                                          catch (e) { var evt = document.createEvent('Event'); evt.initEvent('change', true, true); }
                                                          sel.dispatchEvent(evt);
                                                      } else {
                                                          console.log("File "+vl+" not found in "+currentname);//NFP
                                                      }
                                                  } }, null);
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
             parse:function(sel, obj){
                 if(!options) options = require('options');
                 parse_storage_cr(sel, obj);
             },
             get:function(_fnm, callback){
                 var fnm = _fnm;//.replace("cdvfile://", "/");
                 console.log(fnm+" requested");//NFP
                 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileEntry(named_entries[fnm]), fail);
                 /*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
                 function gotFS(fileSystem){
                        console.log("fileSystem.root.fullPath:");//NFP
                        console.log(fileSystem.root.fullPath);//NFP
                        fileSystem.root.getFile("cdvfile://localhost/persistent"+fnm, null, gotFileEntry, fail);
                     }*/
                 function gotFileEntry(fileEntry){
                        console.log(fnm+" got entry");//NFP
                        fileEntry.file(gotFile, fail);
                     }
                 function gotFile(file){ 
                        console.log(fnm+" got ok");//NFP
                        callback(file);
                     }
                 function fail(error) { console.log("Unable to get the file: " + fnm + "\ngot error:\n"+JSON.stringify(error)); };
             }
    }
  }
);
