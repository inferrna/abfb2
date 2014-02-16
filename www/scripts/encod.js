define(
  ['utf8', 'stuff'],
  function(utf8, stuff){
    return {
        str2utf8b:function(str){
            var strarray = utf8.encode(str);
            var arr = utf8.ucs2decode(strarray);
            var buffer = new ArrayBuffer(arr.length);
            var bufView = new Uint8Array(buffer);
            for (var i=0; i<arr.length; i++) bufView[i] = arr[i];
            return buffer;
        },
        utf8b2str:function(buf){
            var bufView=new Uint8Array(buf);
            strarray = utf8.ucs2encode(bufView);
            return utf8.decode(strarray);
        },
        ab2str:function (buf) { //http://stackoverflow.com/a/16608615
            var bufView=new Uint8Array(buf);
            for (var i=0, l=bufView.length, s='', c; c = bufView[i++];)
            s += String.fromCharCode(
                c > 0xdf && c < 0xf0 && i < l-1
                    ? (c & 0xf) << 12 | (bufView[i++] & 0x3f) << 6 | bufView[i++] & 0x3f
                : c > 0x7f && i < l
                    ? (c & 0x1f) << 6 | bufView[i++] & 0x3f
                : c
            );
            return s;
        },
        str2ab:function (string) { //https://github.com/GoogleChrome/chrome-app-samples/blob/master/serial/adkjs/app/js/serial.js ****
            var buffer = new ArrayBuffer(string.length);
            var bufView = new Uint8Array(buffer);
            for(var i = 0; i < string.length; i++) {
              bufView[i] = string.charCodeAt(i);
            }
            return buffer;
        },
        encodeutf8:function(str) {//http://terenceyim.wordpress.com/2011/03/04/javascript-utf-8-codec-that-supports-supplementary-code-points/
            var len = str.length;
            var result = [];
            var code;
            var buffer = new ArrayBuffer(str.length+4);
            var bufView = new Uint8Array(buffer);
            var i;
            for (i = 0; i < len; i++) {
                code = str.charCodeAt(i);
                if (code <= 0x7f) {
                    result.push(code);
                } else if (code <= 0x7ff) {                         // 2 bytes                     
                    result.push(0xc0 | (code >>> 6 & 0x1f),
                                0x80 | (code & 0x3f));
                } else if (code <= 0xd700 || code >= 0xe000) {      // 3 bytes
                    result.push(0xe0 | (code >>> 12 & 0x0f),
                                0x80 | (code >>> 6 & 0x3f),
                                0x80 | (code & 0x3f));
                } else {                                            // 4 bytes, surrogate pair
                    code = (((code - 0xd800) << 10) | (str.charCodeAt(++i) - 0xdc00)) + 0x10000;
                    result.push(0xf0 | (code >>> 18 & 0x07),
                                0x80 | (code >>> 12 & 0x3f),
                                0x80 | (code >>> 6 & 0x3f),
                                0x80 | (code & 0x3f));
                }
            }
            var i1=0, i2=0, i3=0;
            for (i = 0; i < len; i++){
                bufView[i] = result[i];
                if(result[i] < 0xff) i1++;
                else if(result[i] < 0xffff) i2++;
                else if(result[i] < 0xffffff) i3++;
            }
            return buffer;
        },
        decodeutf8:function(buf) {//http://terenceyim.wordpress.com/2011/03/04/javascript-utf-8-codec-that-supports-supplementary-code-points/
            var bytes = new Uint8Array(buf);
            var len = bytes.length;
            var result = "";
            var code;
            var i;
            for (i = 0; i < len; i++) {
                if (bytes[i] <= 0x7f) {                     
                    result += String.fromCharCode(bytes[i]);
                } else if (bytes[i] >= 0xc0) {                                   // Mutlibytes
                    if (bytes[i] < 0xe0) {                                       // 2 bytes
                        code = ((bytes[i++] & 0x1f) << 6) |
                                (bytes[i] & 0x3f);
                    } else if (bytes[i] < 0xf0) {                                // 3 bytes
                        code = ((bytes[i++] & 0x0f) << 12) |
                               ((bytes[i++] & 0x3f) << 6)  |
                                (bytes[i] & 0x3f);
                    } else {                                                     // 4 bytes
                        // turned into two characters in JS as surrogate pair
                        code = (((bytes[i++] & 0x07) << 18) |
                                ((bytes[i++] & 0x3f) << 12) |
                                ((bytes[i++] & 0x3f) << 6) |                                  
                                 (bytes[i] & 0x3f)) - 0x10000;
                        // High surrogate
                        result += String.fromCharCode(((code & 0xffc00) >>> 10) + 0xd800);
                        // Low surrogate
                        code = (code & 0x3ff) + 0xdc00;
                    }
                    result += String.fromCharCode(code);
                } // Otherwise it's an invalid UTF-8, skipped.
            }
            return result;
        }
    };
  }
);
