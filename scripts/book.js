define(
    ['thepub', 'thetxt'],
  function(thepub, thetxt){
        var foliant = null;
        var thefile = null;
        var evo = null;
        var retxt = /[\w\W]+\.txt/;
        var repub = /[\w\W]+\.epub/;
        return {
                 init:function(file) {
                         if(file.name.match(repub)) foliant = thepub;
                         else if(file.name.match(retxt)) foliant = thetxt;
                         else { console.warn(file.name+" not matched any type"); return ''; } 
                         thefile = file;
                         evo = foliant.evo;
                         return evo;
                 },
                 load:function() {
                         foliant.load(thefile, 'jsepub');
                 },
                 get_page:function(i){
                         console.log("got request");
                         return foliant.get_page(i);
                 },
                 evo:function(){
                         return evo;
                 }
        }
  }
);
