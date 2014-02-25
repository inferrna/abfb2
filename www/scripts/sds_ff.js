define(
  ['require', 'sharedf'],
  function(require, sharedf){
    var options = null;
    var filere = /.*fb2|.*epub|.*txt/i;
    var badtext = "No any book on your SD card. You may try pick it by button above, or put books on SD card and reopen app.";
    function parse_storage_ff(sel, obj){
        "use strict";
        var pics = navigator.getDeviceStorage('sdcard');
        // Let's browse all the images available
        var cursor = pics.enumerate();
        var count = 0;
        cursor.onsuccess = function () {
            function g_or_b(err){
                "use strict";
                if(count>0) {
                    obj.appendChild(sel);
                    options.msg(count+" files found on SD card");
                    options.get_opt('last_file', 
                        function(vl){ for(var i = 1; i < sel.options.length; i++){
                                              if(sel.options[i].value.replace(sharedf.relf, "$2") === vl){
                                                  sel.selectedIndex = i;
                                                  try { var evt = new Event('change');}
                                                  catch (e) { var evt = document.createEvent('Event'); evt.initEvent('change', true, true); }
                                                  sel.dispatchEvent(evt);
                                              }
                                          } }, null);
                } else {
                    sel.parentNode.removeChild(sel);
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
    return {
             parse:function(sel, obj){
                 if(!options) options = require('options');
                 parse_storage_ff(sel, obj);
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
