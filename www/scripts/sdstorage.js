define(
  ['require'],
  function(require){
    var options = null;
    var sds_ls = null;
    if(navigator.getDeviceStorage) sds_ls = require('sds_ff');
    if(window.cordova) sds_ls = require('sds_cr');
    return {
             parse:function(sel, obj){
                 if(sds_ls) sds_ls.parse(sel, obj);
             },
             get:function(_fnm, callback){
                 if(sds_ls) sds_ls.get(fnm, callback);
             }
    }
  }
);
