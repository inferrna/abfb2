define(
  ['require', 'sharedf'],
  function(require, sharedf){
    var options = null;
    var err = '';
    var filere = /.*fb2|.*epub|.*txt/i;
    var badtext = "No any book on your SD card. You may try pick it by button above, or put books on SD card and reopen app.";
    var named_entries = {};
    function parse_storage_cr(sel, obj){
        "use strict";
        function dirScan(directory) {
            var directoryReader = directory.createReader();
            directoryReader.readEntries(function(entries) {
                var i;
                var count = 0;
                for (i=0; i<entries.length; i++) {
                    var entry = entries[i];
                    console.log("Enty found: " + entry.name);
                    if(filere.test(entry.name) && entry.isFile){
                        var nm  = document.createElement("option");
                        var fnm = entry.fullPath;//toURL();// 
                        nm.textContent = fnm;
                        named_entries[fnm] = entry;
                        options.msg("File found: " + entry.name+" url is: "+entry.toURL());
                        console.log("File found: " + entry.name+" url is: "+entry.toURL());//NFP
                        sel.appendChild(nm);
                    } else if (entry.isDirectory) {
                        console.log("Dir found: " + entry.name+" url is: "+entry.toURL());
                    }
                }
                if(Object.keys(named_entries).length > 0) {
                    obj.appendChild(sel);
                    options.msg(count+" files found on SD card");
                    options.get_opt('last_file', 
                        function(vl){ 
                            for(var i = 1; i < sel.options.length; i++){
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
                            } 
                        }, null);
                } else {
                    if(sel.parentNode) sel.parentNode.removeChild(sel);
                    options.msg(badtext+" (err: "+err+")");
                }

            }, function (error) {
                console.warn("Can't parse directory:\n"+error.code);
            });
        } 
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady(){
            "use strict";
            console.log("deviceready fired");//NFP
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                var rootDir = new DirectoryEntry("my_root", '/', fileSystem);
                dirs = ['lib', '/'];
                for(var i=0; i<dirs.length; i++){
                   console.log("Try to scan "+dirs[i]);
                   fileSystem.root.getDirectory(dirs[i], {
                           create: false,
                           exclusive : false
                       }, dirScan);
                }
            }, function(error) {
               alert("can't even get the file system: " + error.code);
            });
        }
    }
    
    return {
             parse:function(sel, obj){
                 console.log("fs scan requested");//NFP
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
