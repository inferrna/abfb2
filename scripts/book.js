define(
    ['thepub'],
  function(thepub){
        var foliant = null;
        var thefile = null;
        var evo = null;
        return {
                 init:function(file) {
                         foliant = thepub;
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
