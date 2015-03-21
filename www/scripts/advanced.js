define(
    ['sharedc', 'sharedf', 'options', 'images', 'asmfuncs'],
    function(sharedc, sharedf, options, images, asmfuncs){
        var advanced = document.getElementById('advanced');
        advanced.style.display = "none";
        var reader = new FileReader();

        var switchdictclr = document.getElementById('switchdictclr');
        var switchmode = document.getElementById('switchmode');
        var switchmtxt = document.getElementById('switchmtxt');
        var switchback = document.getElementById('switchback');
        var switchbtxt = document.getElementById('switchbtxt');
        var customimg  = document.getElementById('customimg');
        var pts = document.getElementById('pts');
        var pt = document.getElementById('pt');
        var pop = document.getElementById('pop');
        var fltext = document.getElementById('fl_text');//txtarea');
        var txarea = document.getElementById('txtarea');
        var opts_brd_b = document.getElementById('options');
        var advbtn = document.createElement("button");
        advbtn.className = "";
        advbtn.style.height = Math.round(32*(window.devicePixelRatio || 1.0))+"px"; advbtn.style.position="fixed";
        advbtn.style.width = advbtn.style.height; advbtn.style.borderRadius="3pt"; advbtn.style.right="1%";
        advbtn.style.backgroundColor = "";
        advbtn.style.backgroundRepeat = "no-repeat";
        advbtn.style.backgroundSize = advbtn.style.height +" "+ advbtn.style.width
        advbtn.style.backgroundImage = 'url('+images.book_svg+')'; advbtn.style.margin="1px"; advbtn.style.border="1px";
        advbtn.onclick = function(){
            if(advanced.style.display === "none"){
                advanced.style.display = "block";
            } else {
                advanced.style.display = "none";
            }
        }
        opts_brd_b.appendChild(advbtn);
        function set_image(src){
            var imageObj = new Image();
            imageObj.onload = function() {
                  var Canvas = document.createElement("canvas");
                  Canvas.id = "mybackgr";
                  Canvas.height = imageObj.height;
                  Canvas.width = imageObj.width;
                  var ctx = Canvas.getContext('2d');
                  ctx.drawImage(this, 0, 0);
                  //Canvas.height = window.innerHeight;//this.height;
                  //Canvas.width = window.innerWidth;//this.width;
                  if(currentback === "custom"){
                      if(1.3*Canvas.height*Canvas.width < this.height*this.width){
                           options.remove_opt("background");
                           options.set_opt("background", Canvas.toDataURL('image/png'));
                      } else {
                           options.remove_opt("background");
                           options.set_opt("background", this.src);
                      }
                  }
                  setback(currentmode, Canvas);
                  Canvas.height = 1;
                  Canvas.width = 1;
                  imageObj.height = 1;
                  imageObj.width = 1;
                  delete ctx, Canvas, imageObj;
            };
            imageObj.src = src;
        }
        var currentmode = "day";
        var currentdmode = "day";
        var currentback = "";
        reader.onload = function(e){
                                set_image(reader.result);
                                currentback = "custom";
                                switchbtxt.textContent = "Default background";
                        }
        customimg.onchange = function(evt){
            reader.readAsDataURL(evt.target.files[0]);
        }

        switchback.addEventListener("click", function (e) {
          if(currentback === "default"){
              if(customimg) {
                customimg.click();
              }
          } else {
              options.remove_opt("background");
              set_default_back();
          }
          e.preventDefault(); // prevent navigation to "#"
        }, false);

        switchdictclr.addEventListener("change", function (e) {
          if (e.target.checked){
              pts.className = "bcol revgradient";
              pt.className = "dpopflex";
              pop.style.backgroundColor = "#000000";
              e.target.checked = true;
              options.set_opt("switchdictclr", "true");
          } else {
              pts.className = "bcol gradient";
              pt.className = "popflex";
              pop.style.backgroundColor = "#bdbdbd";
              e.target.checked = false;
              options.set_opt("switchdictclr", "false");
          }
          e.preventDefault(); // prevent navigation to "#"

        }, false);

        switchmode.addEventListener("change", function (e) {
          if (e.target.checked){
              currentmode = "night";
              options.set_opt("switchmode", "true");
          } else {
              currentmode = "day";
              options.set_opt("switchmode", "false");
          }
          options.get_opt("background", function(value){
            if(value){
                set_image(value);
                currentback = "custom";
                switchbtxt.textContent = "Default background";
            } else {
                set_default_back();
            }
          });
          e.preventDefault(); // prevent navigation to "#"
        }, false);


        function setback(mode, Canvas){
              if(currentback === "default" && mode === "day"){
                  txarea.style.backgroundImage = 'url(' + Canvas.toDataURL('image/png')+ ')';
                  fltext.style.color = "#000000";
                  txarea.className = "gradient";
                  return 0;
              }
              var ctx = Canvas.getContext('2d');
              var pixels = ctx.getImageData(0, 0, Canvas.width, Canvas.height);
              var len = Canvas.width*4; //In bytes
              var lsum = 0.0;
              var lmax = 0.0;
              var lmin = 1.0;
              var color = "#000000";
              var bs = asmfuncs.bufsize;
              var cnt = Math.floor(bs/len);
              var minm = asmfuncs.minmaxv(pixels.data, cnt*Canvas.width*4, Canvas.height/cnt);
              lmax = minm[0]; lmin = minm[1]; avgl = minm[2];
              if(mode === "night"){ 
                  lsum = 0.0;
                  if(avgl < 0.49){
                    txarea.className = "gradient";
                    c = 0.5; //Protect from div by zero.
                    add = 0.5;
                  } else {
                    txarea.className = "revgradient";
                    c = lmax/5.0;
                    add = 0.0;
                  }
                  minm = asmfuncs.applyscale(pixels.data, cnt*Canvas.width*4, Canvas.height/cnt, c, add);
                  lmax = minm[0]; lmin = minm[1]; avgl = minm[2];
              }
              if(avgl < 0.49){
                  var rgb = sharedf.hsvToRgb(0, 0, Math.min(0.9, avgl+0.7))
                  color = 'rgb('+rgb[0]+', '+rgb[1]+', '+rgb[2]+')'
              }
              ctx.putImageData(pixels, 0, 0);
              txarea.style.backgroundImage = 'url(' + Canvas.toDataURL('image/jpg')+ ')';
              fltext.style.color = color;
              delete pixels;
        }

        function set_default_back(){
                    //if ( window.cordova ) {
                        var images = require("images");
                        if(window.innerWidth<512) set_image(images.img_tiny);
                        else if (window.innerWidth<1024) set_image(images.img_small);
                        else set_image(images.img);
                    /*} else {
                        if(window.innerWidth<512) imageObj.src = '../images/back_tiny.jpg';
                        else if (window.innerWidth<1024) imageObj.src = '../images/back_small.jpg';
                        else imageObj.src = '../images/back.jpg';
                    }*/
                    currentback = "default";
                    switchbtxt.textContent = "Change background";
                    options.remove_opt("background");
        }
        options.get_opt("background", function(value){
                    if(value){
                        set_image(value);
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
