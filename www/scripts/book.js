define(
    ['thepub', 'thefb2', 'thetxt', 'stuff', 'sharedc'],
  function(thepub, thefb2, thetxt, stuff, sharedc){
        var foliant = null;
        var thefile = null;
        var evo = null;
        var retxt = /[\w\W]+\.txt/;
        var repub = /[\w\W]+\.(epub|zip)/;
        var refb2 = /[\w\W]+\.fb2/;
        var filename = 'name';
        return {
                 init:function(file) {
                         if(file) filename = file.name;
                         if(filename.match(repub)) foliant = thepub;
                         else if(filename.match(retxt)) foliant = thetxt;
                         else if(filename.match(refb2)) foliant = thefb2;
                         else { console.warn(filename+" not matched any type"); return ''; } 
                         foliant.init();
                         sharedc.register('book', 'last_html', foliant.render_all_pages);
                         thefile = file;
                         evo = foliant.evo;
                         return evo;
                 },
                 load:function() {
                         foliant.load(thefile, 'jsepub');
                 },
                 get_page:function(i){
                         console.log("got request");//NFP
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
