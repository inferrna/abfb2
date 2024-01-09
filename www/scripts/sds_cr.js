define(
  ['require', 'sharedf', 'log'],
  function(require, sharedf, log){
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
                    log.warn("Enty found: " + entry.name);
                    if(filere.test(entry.name) && entry.isFile){
                        var nm  = document.createElement("option");
                        var fnm = entry.fullPath;//toURL();// 
                        nm.textContent = fnm;
                        named_entries[fnm] = entry;
                        options.msg("File found: " + entry.name+" url is: "+entry.toURL());
                        log.warn("File found: " + entry.name+" url is: "+entry.toURL());//NFP
                        sel.appendChild(nm);
                    } else if (entry.isDirectory) {
                        log.warn("Dir found: " + entry.name+" url is: "+entry.toURL());
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
                                    log.warn("File "+currentname+" found");//NFP
                                    sel.selectedIndex = i;
                                    try { var evt = new Event('change');}
                                    catch (e) { var evt = document.createEvent('Event'); evt.initEvent('change', true, true); }
                                    sel.dispatchEvent(evt);
                                } else {
                                    log.warn("File "+vl+" not found in "+currentname);//NFP
                                }
                            } 
                        }, null);
                } else {
                    if(sel.parentNode) sel.parentNode.removeChild(sel);
                    options.msg(badtext+" (err: "+err+")");
                }

            }, function (error) {
                log.warn("Can't parse directory:\n"+error.code);
            });
        } 
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady(){
            "use strict";
            log.warn("deviceready fired");//NFP
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                var rootDir = new DirectoryEntry("my_root", '/', fileSystem);
                dirs = ['lib', '/', 'Download', 'sdcard', 'sdcard/Download', 'books'];
                for(var i=0; i<dirs.length; i++){
                   log.warn("Try to scan "+dirs[i]);
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
                 log.warn("fs scan requested");//NFP
                 if(!options) options = require('options');
                 parse_storage_cr(sel, obj);
             },
             get:function(_fnm, callback){
                 var fnm = _fnm;//.replace("cdvfile://", "/");
                 log.warn(fnm+" requested");//NFP
                 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileEntry(named_entries[fnm]), fail);
                 /*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
                 function gotFS(fileSystem){
                        log.warn("fileSystem.root.fullPath:");//NFP
                        log.warn(fileSystem.root.fullPath);//NFP
                        fileSystem.root.getFile("cdvfile://localhost/persistent"+fnm, null, gotFileEntry, fail);
                     }*/
                 function gotFileEntry(fileEntry){
                        log.warn(fnm+" got entry");//NFP
                        fileEntry.file(gotFile, fail);
                     }
                 function gotFile(file){ 
                        log.warn(fnm+" got ok");//NFP
                        callback(file);
                     }
                 function fail(error) { log.warn("Unable to get the file: " + fnm + "\ngot error:\n"+JSON.stringify(error)); };
             }
    }
  }
);
