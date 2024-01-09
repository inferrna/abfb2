define(
    ['thepub', 'thefb2', 'thetxt', 'stuff', 'sharedc', 'log'],
  function(thepub, thefb2, thetxt, stuff, sharedc, log){
        var foliant = null;
        var thefile = null;
        var evo = null;
        var retxt = /[\w\W]+\.txt/;
        var repub = /[\w\W]+\.(epub|zip)/;
        var refb2 = /[\w\W]+\.fb2/;
        var filename = '';
        function getMethods(obj) {
          var result = [];
          for (var id in obj) {
            try {
              if (typeof(obj[id]) == "function") {
                result.push(id + ": " + obj[id].toString());
              }
            } catch (err) {
              result.push(id + ": inaccessible");
            }
          }
          return result;
        }

        return {
                 init:function(file) {
                         var Reader = new FileReader();
                         Reader.onload = function(evt) {
                             var content = new String(evt.target.result);
                             log.warn("File content: "+content);
                         };

                         if(file) filename = file.name;
                         if(filename.length<1 && file.localURL != undefined && file.localURL != null && file.localURL.length>1) {
                             filename == file.localURL;
                         }
                         log.warn("Got file with type "+(typeof file)+" and name "+filename);
                         if(filename.match(repub)) foliant = thepub;
                         else if(filename.match(retxt)) foliant = thetxt;
                         else if(filename.match(refb2)) foliant = thefb2;
                         else {
                             Reader.readAsText(file, "UTF-8"); //Testing call, only for small files
                             log.warn(filename+" not matched any type");
                             return ''; 
                         } 
                         foliant.init();
                         thefile = file;
                         evo = foliant.evo;
                         return evo;
                 },
                 load:function() {
                         foliant.load(thefile, 'jsepub');
                 },
                 get_page:function(i){
                         return foliant.get_page(i);
                 },
                 evo:function(){
                         return evo;
                 },
                 currentpage:function(){
                         return foliant.currentpage()
                 },
                 foliant:function(){
                         return foliant;
                 }
        }
  }
);
