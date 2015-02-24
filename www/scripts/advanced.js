define(
    ['sharedc', 'sharedf', 'options', 'images'],
    function(sharedc, sharedf, options, images){
        console.log("advanced loaded");//NFP
        var advanced = document.getElementById('advanced');
        advanced.style.display = "none";
        var switchdictclr = document.getElementById('switchdictclr');
        var switchmode = document.getElementById('switchmode');
        var switchmtxt = document.getElementById('switchmtxt');
        var switchback = document.getElementById('switchback');
        var switchbtxt = document.getElementById('switchbtxt');
        var customimg  = document.getElementById('customimg');
        var pts = document.getElementById('pts');
        var pt = document.getElementById('pt');
        var txarea = document.getElementById('txtarea');
        var clrs = [[222,211,165], [235,232,200], [209,200,148]];
        var opts_brd_b = document.getElementById('options');
        var advbtn = document.createElement("div");
        advbtn.type="range"; advbtn.style.height="15px"; advbtn.style.position="absolute";
        advbtn.style.width="18%"; advbtn.style.borderRadius="3px"; advbtn.style.right="1%";
        advbtn.style.backgroundColor="#010203"; advbtn.style.margin="1px"; advbtn.style.border="1px";
        opts_brd_b.appendChild(advbtn);
        advbtn.onclick = function(){
            if(advanced.style.display === "none"){
                advanced.style.display = "block";
            } else {
                advanced.style.display = "none";
            }
        }

        var Canvas = document.createElement("canvas");
        Canvas.id = "mybackgr";
        var imageObj = new Image();
        var currentmode = "day";
        var currentdmode = "day";
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

        switchdictclr.addEventListener("change", function (e) {
          console.log("e.target.checked");//NFP
          console.log(e.target.checked);//NFP
          if (e.target.checked){
              pts.className = "bcol revgradient";
              pt.className = "dpopflex";
              e.target.checked = true;
              options.set_opt("switchdictclr", "true");
          } else {
              pts.className = "bcol gradient";
              pt.className = "popflex";
              e.target.checked = false;
              options.set_opt("switchdictclr", "false");
          }
          e.preventDefault(); // prevent navigation to "#"

        }, false);

        switchmode.addEventListener("change", function (e) {
          console.log("switchmode checked");//NFP
          if (e.target.checked){
              currentmode = "night";
              options.set_opt("switchmode", "true");
          } else {
              currentmode = "day";
              options.set_opt("switchmode", "false");
          }
          setback(currentmode);
          e.preventDefault(); // prevent navigation to "#"
        }, false);

        imageObj.onload = function() {
              Canvas.height = this.height;
              Canvas.width = this.width;
              setback(currentmode);
        };

        function daymode(){
              var ctx = Canvas.getContext('2d');
              ctx.drawImage(imageObj, 0, 0);
              console.log("Iage loaded");//NFP
              txarea.style.backgroundImage = 'url(' + Canvas.toDataURL('image/png')+ ')';
              txarea.style.color = "#000000";
        }

        function setback(mode){
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
              if(mode === "night"){ 
                  lsum = 0.0;
                  if(avgl < 0.49){
                    c = 0.3; //Protect from div by zero.
                    add = 0.7;
                  } else {
                    c = lmax/5.0;
                    add = 0.0;
                  }
                  for (var i = 0; i < all; i += 4) {
                      var r = pixels.data[i];
                      var g = pixels.data[i+1];
                      var b = pixels.data[i+2];
                      var hsl = sharedf.rgbToHsv(r, g, b);
                      hsl[2] = Math.min(1.0, add+hsl[2]*c);
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
                    options.get_opt("switchmode", function(value){
                                    var evt = document.createEvent('Event'); 
                                    evt.initEvent('change', true, true);
                                    if(value==="true"){
                                        switchmode.checked = true;
                                    } else {
                                        switchmode.checked = false;
                                    }
                                    switchmode.dispatchEvent(evt);
                            });
            });
        options.get_opt("switchdictclr", function(value){
                        var evt = document.createEvent('Event'); 
                        evt.initEvent('change', true, true);
                        if(value==="true"){
                            switchdictclr.checked = true;
                        } else {
                            switchdictclr.checked = false;
                        }
                        switchdictclr.dispatchEvent(evt);
                });
        return {
        }
    }
);
