define(
  ['require', 'sharedf'],
  function(require, sharedf){
    var options = null;
    var filere = /.*\.fb2$|.*\.epub$|.*\.txt$/i;
    var badtext = "No any book on your SD card. You may try pick it by button above, or put books on SD card and reopen app.";
    function parse_storage_ff(sel, obj, callback){
        "use strict";
        var pics = navigator.getDeviceStorage('sdcard');
        // Let's browse all the images available
        var paths = ['books', 'Books', 'Library', 'library', 'Download', 'download'];
        var count = 0;
        var filenames = [];
        for(var p in paths){
            var cursor = pics.enumerate({'path': paths[p]});
            cursor.onsuccess = onsuccess;
            cursor.onerror = onerror;
        }
        function onerror() {
          console.warn("No file found "+this.error);
          options.msg(badtext);
        }
        function onsuccess() {
            function g_or_b(err){
                "use strict";
                callback(filenames);
            }
            if(this.result!=undefined) var file = this.result;
            else { 
                g_or_b("file undefined");
                return;
            }
            try{
                if(filere.test(file.name)){
                    if(filenames.indexOf(file.name)===-1){
                        count++;
                        options.msg("File found: " + file.name);
                        filenames.push(file.name);
                    }
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
    }
    return {
             parse:function(sel, obj, clbk){
                 if(!options) options = require('options');
                 parse_storage_ff(sel, obj, clbk);
             },
             get:function(_fnm, callback){
                 var fnm = _fnm.replace("file://", "");
                 var sdcard = navigator.getDeviceStorage('sdcard');
                 var request = sdcard.get(fnm);
                 request.onsuccess = function(){callback(this.result);};
                 request.onerror = function () { console.warn("Unable to get the file: " + fnm + "got error: '\n    "+this.error); };
             }
    }
  }
);
