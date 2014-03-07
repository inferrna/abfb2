define(
  ['require', 'sds_ff', 'sds_cr'],
  function(require){
    var options = null;
    var sds_ls = null;
    if(navigator.getDeviceStorage) sds_ls = require('sds_ff');
    if(window.cordova) sds_ls = require('sds_cr');
    console.log("file api is"+sds_ls);//NFP
    return {
             parse:function(sel, obj){
                 if(sds_ls) sds_ls.parse(sel, obj);
             },
             get:function(fnm, callback){
                 if(sds_ls) sds_ls.get(fnm, callback);
             }
    }
  }
);
