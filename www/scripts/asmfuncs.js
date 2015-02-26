define(
  [],
  function(){
    console.log("Starts asms");//NFP
    function AsmFuncs(stdlib, env, heap) {
        "use asm";
        var absf = stdlib.Math.abs;
        var imulf = stdlib.Math.imul;
        var minf = stdlib.Math.min;
        var floorf = stdlib.Math.floor;
        var maxf = stdlib.Math.max;
        var res32f = new stdlib.Float32Array(heap);
        var res8u = new stdlib.Uint8Array(heap);
        function hsvToRgb(h, s, v){
            h = +h;
            s = +s;
            v = +v;
            var i = 0;
            var f = 0.0;
            var p = 0.0;
            var q = 0.0;
            var t = 0.0;
            var r = 0.0;
            var g = 0.0;
            var b = 0.0;
            i = 0|0;
            i = ~~+floorf(h * 6.0);
            f = h * 6.0 - +~~i;
            p = v * (1.0 - s);
            q = v * (1.0 - f * s);
            t = v * (1.0 - (1.0 - f) * s);
            switch((~~i % ~~6)|0){
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            res8u[0] = ~~+(r*255.0);
            res8u[1] = ~~+(g*255.0);
            res8u[2] = ~~+(b*255.0);
        }
        function rgbToHsv(r, g, b){
            r = r|0;
            g = g|0;
            b = b|0;
            var min = 0;
            var max = 0;
            var a = 0.0;
            var h = 0.0;
            var s = 0.0;
            var v = 0.0;
            var d = 0.0;
            max = max|0, min = min|0;
            max = ~~+maxf(+~~r, +~~g, +~~b);
            min = ~~+minf(+~~r, +~~g, +~~b);
            v = +~~max;
            d = +~~max - +~~min;
            if(~~max == ~~0){
                s = 0.0;
            } else {
                s = +~~d / +~~max;
            }
            if(~~max == ~~min){
                h = 0.0;
            } else {
                if(~~max == ~~r){
                    if((b - g)|0 > 0){
                        a = 6.0;
                    }
                    h = +~~(g - b) / d + a;
                } else if(~~max == ~~g){ 
                    h = +~~(b - r) / d + 2.0;
                } else if(~~max == ~~b){
                    h = +~~(r - g) / d + 4.0;
                }
                h = h/6.0;
            }
            res32f[0<<2>>2] = h;
            res32f[1<<2>>2] = s;
            res32f[2<<2>>2] = v/255.0;
        }
        return {
            rgbToHsv:rgbToHsv,
            hsvToRgb:hsvToRgb
        }
    }
    var buffer = new ArrayBuffer(256*1024);
    var array  = new Float32Array(buffer);
    var res3farray  = new Float32Array(buffer, 0, 3);
    var res3iarray  = new Uint8Array(buffer, 0, 3);
    var asm_funcs = AsmFuncs(window, 0, buffer);
    asm_funcs.rgbToHsv(27, 224, 156);
    console.log(res3farray[0], res3farray[1], res3farray[2]);
    asm_funcs.hsvToRgb(0.3, 0.5, 0.7);
    console.log(res3iarray[0], res3iarray[1], res3iarray[2]);

    return {
        rgbToHsv: function(r, g, b){
            asm_funcs.rgbToHsv(r, g, b);
            return res3farray;
        },
        hsvToRgb: function(h, s, v){
            asm_funcs.hsvToRgb(h, s, v);
            return res3iarray;
        }
    }
  }
);
