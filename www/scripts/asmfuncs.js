define(
  [],
  function(){
    function AsmFuncs(stdlib, env, heap) {
        "use asm";
        var absf = stdlib.Math.abs;
        var imulf = stdlib.Math.imul;
        var minf = stdlib.Math.min;
        var floorf = stdlib.Math.floor;
        var froundf = stdlib.Math.fround;
        var maxf = stdlib.Math.max;
        var res32f = new stdlib.Float32Array(heap);
        var res8u = new stdlib.Uint8Array(heap);
        var inp8u = new stdlib.Uint8Array(heap);
        function processl(len, c, add){
            len = len|0;
            c = +c;
            add = +add;
            var i = 0;
            var max = 0.0;
            var min = 1.0;
            var avg = 0.0;
            i = 0|0;
            for(i = 0; ~~i<~~len; i = (i+4)|0){
                rgbToHsv(inp8u[(i+0+256)|0]|0, inp8u[(i+1+256)|0]|0, inp8u[(i+2+256)|0]|0);
                res32f[2<<2>>2] = +minf(1.0, add + +res32f[2<<2>>2]*c);
                if(+res32f[2<<2>>2] > +max){
                    max = +res32f[2<<2>>2];
                } else if(+res32f[2<<2>>2] < +min){
                    min = +res32f[2<<2>>2];
                }
                avg = avg + +res32f[2<<2>>2];
                hsvToRgb(+res32f[0<<2>>2], +res32f[1<<2>>2], +res32f[2<<2>>2]);
                inp8u[(i+0+256)|0] = res8u[0|0];
                inp8u[(i+1+256)|0] = res8u[1|0];
                inp8u[(i+2+256)|0] = res8u[2|0];
            }
            res32f[0<<2>>2] = max;
            res32f[1<<2>>2] = min;
            res32f[2<<2>>2] = avg;
        }
        function getmaxv(len){
            len = len|0;
            var i = 0;
            var max = 0.0;
            var min = 1.0;
            var avg = 0.0;
            i = 0|0;
            for(i = 0; ~~i<~~len; i = (i+4)|0){
                rgbToHsv(inp8u[(i+0+256)|0]|0, inp8u[(i+1+256)|0]|0, inp8u[(i+2+256)|0]|0);
                if(+res32f[2<<2>>2] > +max){
                    max = +res32f[2<<2>>2];
                } else if(+res32f[2<<2>>2] < +min){
                    min = +res32f[2<<2>>2];
                }
                avg = avg + +res32f[2<<2>>2];
            }
            res32f[0<<2>>2] = max;
            res32f[1<<2>>2] = min;
            res32f[2<<2>>2] = avg;
        }
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
            hsvToRgb:hsvToRgb,
            getmaxv:getmaxv,
            processl:processl
        }
    }
    var buffer = new ArrayBuffer(256*1024);
    var array  = new Float32Array(buffer);
    var inp8array   = new Uint8Array(buffer, 256);
    var res3farray  = new Float32Array(buffer, 0, 3);
    var res3iarray  = new Uint8Array(buffer, 0, 3);
    var asm_funcs = AsmFuncs(window, 0, buffer);
    asm_funcs.rgbToHsv(27, 224, 156);
    asm_funcs.hsvToRgb(0.3, 0.5, 0.7);

    return {
        rgbToHsv: function(r, g, b){
            asm_funcs.rgbToHsv(r, g, b);
            return res3farray;
        },
        hsvToRgb: function(h, s, v){
            asm_funcs.hsvToRgb(h, s, v);
            return res3iarray;
        },
        minmaxv: function(arr, len, cnt){
            var res, max=0.0, min=1.0, avg=0.0;
            var start, end, truelen, maxl = arr.byteLength;
            for(var i=0; i<cnt; i++){
                start = len*i;
                end = Math.min(maxl, start+len);
                truelen = end - start;
                inp8array.set( arr.subarray(start, end) );
                asm_funcs.getmaxv(truelen);
                if(max < res3farray[0]) max = res3farray[0];
                if(min > res3farray[1]) min = res3farray[1];
                avg += res3farray[2];
            }
            avg = 4*avg / (len*cnt);
            return [max, min, avg];
        },
        applyscale: function(arr, len, cnt, c, add){
            var res, max=0.0, min=1.0, avg=0.0;
            var start, end, truelen, maxl = arr.byteLength;
            for(var i=0; i<cnt; i++){
                start = len*i;
                end = Math.min(maxl, start+len);
                truelen = end - start;
                inp8array.set( arr.subarray(start, end) );
                asm_funcs.processl(truelen, c, add);
                arr.subarray(start, end)
                            .set(inp8array.subarray(0, truelen));
                if(max < res3farray[0]) max = res3farray[0];
                if(min > res3farray[1]) min = res3farray[1];
                avg += res3farray[2];
            }
            avg = 4*avg / (len*cnt);
            return [max, min, avg];
        },
        bufsize: inp8array.byteLength

    }
  }
);
