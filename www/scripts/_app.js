define(
    ['app'],
  function(){
      if(window.cordova){
          document.addEventListener("deviceready", function(){
                var app = require("app");
                console.log("cordova.file:");
                console.log(cordova.file);  
                var permissions = cordova.plugins.permissions;
                permissions.requestPermissions([permissions.INTERNET, permissions.READ_EXTERNAL_STORAGE], permSucces, permFailed);
                function permSucces(){
                    console.log("Successfully init permissions");
                }
                function permFailed(){
                    console.log("Unsuccessfully init permissions");
                }
              }, false);
      } else {
            var app = require("app");
          }
  }
);
