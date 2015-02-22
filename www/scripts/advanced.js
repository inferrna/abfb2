define(
    ['sharedc', 'sharedf', 'options', 'images'],
    function(sharedc, sharedf, options, images){
        console.log("advanced loaded");//NFP
        var advanced = document.getElementById('advanced');
        var switchmode = document.getElementById('switchmode');
        var switchmtxt = document.getElementById('switchmtxt');
        var switchback = document.getElementById('switchback');
        var switchbtxt = document.getElementById('switchbtxt');
        var customimg  = document.getElementById('customimg');
        var txarea = document.getElementById('txtarea');
        var Canvas = document.createElement("canvas");
        Canvas.id = "mybackgr";
        var imageObj = new Image();
        var currentmode = "day";
        var currentback = "";
        customimg.onchange = function(evt){
            var imageurl = window.URL.createObjectURL(evt.target.files[0])
            options.set_opt("background", imageurl);
            imageObj.src = imageurl;
            currentback = "custom";
            switchbtxt.textContent = "Default background";
        }

        switchback.addEventListener("click", function (e) {
          console.log("switchback clicked");//NFP
          if (currentback === "default"){
              if (customimg) {
                customimg.click();
              }
          } else {
              options.remove_opt("background");
              set_default_back();
          }
          e.preventDefault(); // prevent navigation to "#"
        }, false);

        switchmode.addEventListener("click", function (e) {
          console.log("switchmode clicked");//NFP
          if (currentmode === "day"){
              currentmode = "night";
          } else {
              currentmode = "day";
          }
          setback();
          e.preventDefault(); // prevent navigation to "#"
        }, false);

        imageObj.onload = function() {
              Canvas.height = this.height;
              Canvas.width = this.width;
              setback();
        };

        function daymode(){
              var ctx = Canvas.getContext('2d');
              ctx.drawImage(imageObj, 0, 0);
              console.log("Iage loaded");//NFP
              txarea.style.backgroundImage = 'url(' + Canvas.toDataURL('image/png')+ ')';
              txarea.style.color = "#000000";
        }

        function setback(){
              var ctx = Canvas.getContext('2d');
              ctx.drawImage(imageObj, 0, 0);
              var pixels = ctx.getImageData(0, 0, Canvas.width, Canvas.height);
              var all = pixels.data.length;
              var lsum = 0.0;
              var lmax = 0.0;
              var lmin = 1.0;
              var color = "#000000"
              for (var i = 0; i < all; i += 4) {
                  var r = pixels.data[i];
                  var g = pixels.data[i+1];
                  var b = pixels.data[i+2];
                  var hsl = sharedf.rgbToHsv(r, g, b);
                  if(hsl[2]>lmax) lmax = hsl[2];
                  if(hsl[2]<lmin) lmin = hsl[2];
                  lsum += hsl[2];
              }
              var c = 0.0;
              var add = 0.0;
              var avgl = 4*lsum/all;
              if(currentmode != "day"){ 
                  lsum = 0.0;
                  if(avgl < 0.49){
                    c = 2.0;
                    add = 0.25
                  } else {
                    c = lmax/5.0;
                    add = 0.0;
                  }
                  for (var i = 0; i < all; i += 4) {
                      var r = pixels.data[i];
                      var g = pixels.data[i+1];
                      var b = pixels.data[i+2];
                      var hsl = sharedf.rgbToHsv(r, g, b);
                      hsl[2] = Math.min(1.0,(add+hsl[2])*c);
                      lsum += hsl[2];
                      var rgb = sharedf.hsvToRgb(hsl[0], hsl[1], hsl[2]);
                      pixels.data[i]   = rgb[0];
                      pixels.data[i+1] = rgb[1];
                      pixels.data[i+2] = rgb[2];
                  }
              }
              avgl = 4*lsum/all;
              if(avgl < 0.49){
                  color = "#eeeeee";
              }
              ctx.putImageData(pixels, 0, 0);
              txarea.style.backgroundImage = 'url(' + Canvas.toDataURL('image/png')+ ')';
              txarea.style.color = color;
              delete pixels;
        }

        function set_default_back(){
                    //if ( window.cordova ) {
                        var images = require("images");
                        if(window.innerWidth<512) imageObj.src = images.img_tiny;
                        else if (window.innerWidth<1024) imageObj.src = images.img_small;
                        else imageObj.src = images.img;
                    /*} else {
                        if(window.innerWidth<512) imageObj.src = '../images/back_tiny.jpg';
                        else if (window.innerWidth<1024) imageObj.src = '../images/back_small.jpg';
                        else imageObj.src = '../images/back.jpg';
                    }*/
                    currentback = "default";
                    switchbtxt.textContent = "Change background";
        }
        options.get_opt("background", function(value){
                    if(value){
                        imageObj.src = value;
                        currentback = "custom";
                        switchbtxt.textContent = "Default background";
                    } else {
                        set_default_back();
                    }
            });
        return {
        }
    }
);
