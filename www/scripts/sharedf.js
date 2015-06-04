define(
  ['asmfuncs'],
  function(asmfuncs){
    console.log("Starts sharedf");//NFP
    function clean_tag(doc, tag){
            var tags = doc.getElementsByTagName(tag);
            for (var i = 0, il = tags.length; i < il; i++) {
                var ltag = tags[i];
                if(ltag){
                    while (ltag.childNodes.length > 0) {
                        ltag.parentNode.appendChild(ltag.childNodes[0]);
                    }
                    ltag.parentNode.removeChild(ltag);
                }
            }
            tags = doc.getElementsByTagName(tag);
            if (tags.length>0) clean_tag(doc, tag);
    }
    function create_style(css){
        style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }
    }

    function move_tag(oldparent, tag, newparent){
            var tags = oldparent.getElementsByTagName(tag);
            for (var i = 0, il = tags.length; i < il; i++) {
                var ltag = tags[i];
                if(ltag){
                    newparent.appendChild(ltag);
                    //console.log();//NFP
                    //ltag.parentNode.removeChild(ltag);
                }
            }
            tags = oldparent.getElementsByTagName(tag);
            if (tags.length>0) move_tag(oldparent, tag, newparent);
    }
    /**
     * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
     * http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    /**
     * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
     * http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSL representation
     */
    function rgbToHsl(r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSV representation
     */
    function rgbToHsv(r, g, b){
        r = r/255, g = g/255, b = b/255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if(max == min){
            h = 0; // achromatic
        }else{
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, v];
    }

    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  v       The value
     * @return  Array           The RGB representation
     */
    function hsvToRgb(h, s, v){
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch(i % 6){
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [r * 255, g * 255, b * 255];
    }

    return {
            move_tags:function(oldparent, taglst, newparent){
                console.log("newparent is ");//NFP
                console.log(newparent);//NFP
                console.log("oldparent is ");//NFP
                console.log(oldparent);//NFP
                for (var i=0; i<taglst.length; i++){
                     move_tag(oldparent, taglst[i], newparent);
                }
            },
            clean_tags:function(doc, taglst){
                for (var i=0; i<taglst.length; i++){
                     clean_tag(doc, taglst[i]);
                }
            },
            /*binary files*/
            reb: /.+?\.(jpeg|jpg|gif|png|woff|otf|ttf|bmp|wav)/i,
            /*text files*/
            ret: /.*?\.?(mimetype|txt|htm|html|xhtml|ncx|xml|css|smil|pls|opf|svg)/i,
            /* last file */
            relf: /(.*?\/)+(.+?)/gi,
            rgbToHsl:rgbToHsl,
            hslToRgb:hslToRgb,
            rgbToHsv:asmfuncs.rgbToHsv,
            hsvToRgb:asmfuncs.hsvToRgb
    }
  }
);
