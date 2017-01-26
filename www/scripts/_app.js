define(
    ['app'],
  function(){
      if(window.cordova){
          document.addEventListener("deviceready", function(){
                var app = require("app");
                console.log("cordova.file:");
                console.log(cordova.file);  
              }, false);
      } else {
            var app = require("app");
          }
  }
);
