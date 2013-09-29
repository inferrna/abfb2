define(
    ['thepub', 'thefb2', 'thetxt', 'stuff'],
  function(thepub, thefb2, thetxt, stuff){
        var foliant = null;
        var thefile = null;
        var evo = null;
        var retxt = /[\w\W]+\.txt/;
        var repub = /[\w\W]+\.epub/;
        var refb2 = /[\w\W]+\.fb2/;
        return {
                 init:function(file) {
                         if(file.name.match(repub)) foliant = thepub;
                         else if(file.name.match(retxt)) foliant = thetxt;
                         else if(file.name.match(refb2)) foliant = thefb2;
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
                 },
                 foliant:function(){
                         return foliant;
                 }
        }
  }
);
