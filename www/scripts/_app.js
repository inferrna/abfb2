define(
    ['app'],
  function(){
      if(window.cordova){
          document.addEventListener("deviceready", function(){
                /*requirejs.config({ shim: {"jsxml":{"deps": [], "exports": "jsxml"}}});
                requirejs.config({ shim: {"zip":{"deps": [], "exports": "zip"}}});*/
                var app = require("app");
              }, false);
      } else {
            /*requirejs.config({ shim: {"jsxml":{"deps": [], "exports": "jsxml"}}});
            requirejs.config({ shim: {"inflate":{"deps": ['zip'], "exports": "inflate"}}});
            requirejs.config({ shim: {"zip":{"deps": [], "exports": "zip"}}});*/
            var app = require("app");
          }
  }
);
