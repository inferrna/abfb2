define(
  [],
  function(){
            function getdatas(params){
                    if(params[1]>=params[0].length){ go_all(); return; }
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
            get_contents:function(file, callback){
                zip.createReader(new zip.BlobReader(file),function (zipReader){zipReader.getEntries(callback);});
            },
            get_files:function(file, callback, filelst){
                zip.createReader(new zip.BlobReader(file),function (zipReader){getdatas([filelst, 0, zipReader]);});
            }
    }
  }
);
