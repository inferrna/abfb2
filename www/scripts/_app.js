define(
    ['app'],
  function(){
      if(window.cordova){
          document.addEventListener("deviceready", function(){
                var app = require("app");
              }, false);
      } else {
            var app = require("app");
          }
  }
);
