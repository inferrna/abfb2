define(
  ['sharedf'],
  function(sharedf){
        var files = {};
        var b64blobs = [];
        var globclbk = function(){};
        filename = [];
        function extract_data(blob, index, array, callback, params, mtype){
            var reader = new FileReader();
            console.log("Extracting "+index);//NFP
            if(files[index]) console.warn("dublicated index "+index);
            if(reader.addEventListener){
                reader.addEventListener("loadend", function() {
                       array[index]=reader.result;
                       callback(params);
                    });
            } else {
                reader.onload = function(e){
                        array[index]=reader.result;
                        callback(params);
                    }
            }
            if(mtype==='blob') {reader.readAsDataURL(blob); b64blobs.push(index);}
            else reader.readAsText(blob);
            delete reader;
        }
        function fill_files(data, name, callback, params){
            params[1]++; //i
            if (sharedf.reb.test(name)){
                logger("extracting blob: " +name+"...");
                extract_data(data, name, files, callback, params, 'blob');
            } else if (sharedf.ret.test(name)){
                logger("extracting text: " +name+"...");
                extract_data(data, name, files, callback, params, 'text');
            } else callback(params);
            delete data;
        }
        function getdatas(params){
            if(params[1]>=params[0].length){ globclbk(files); return; }
            var entries = params[0], i = params[1], reader = params[2];
            filenames.push(entries[i].filename);
            entries[i].getData(new zip.BlobWriter(), function (data) {
                    console.log("unzip "+i);//NFP
                    fill_files(data, filenames[i], getdatas, [entries, i, reader]);
                    reader.close(function () {   });
                    i++;
                }, function(current, total) {
                });
        }
    return {
            empty:function(){
                files = {};
                b64blobs = [];
            },
            get_contents:function(file, callback){
                zip.createReader(new zip.BlobReader(file),function (zipReader){zipReader.getEntries(callback);});
            },
            get_files:function(file, callback, filelst){
                globclbk = callback;
                zip.createReader(new zip.BlobReader(file),function (zipReader){getdatas([filelst, 0, zipReader]);});
            }
    }
  }
);
