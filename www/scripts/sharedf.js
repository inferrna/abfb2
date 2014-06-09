define(
  [],
  function(){
    function clean_tag(doc, tags, tag){
            var tags = doc.getElementsByTagName(tag);
            for (var i = 0, il = tags.length; i < il; i++) {
                var ltag = tags[i];
                if(ltag){
                    while (ltag.childNodes.length > 0) {
                        ltag.parentNode.appendChild(ltag.childNodes[0]);
                    }
                    ltag.parentNode.removeChild(ltag);
                }
            }
            tags = doc.getElementsByTagName(tag);
            if (tags.length>0) clean_tag(doc, tags, tag);
    }
    return {
            clean_tags:function(doc, taglst){
                for (var i=0; i<taglst.length; i++){
                     clean_tag(doc, doc.getElementsByTagName(taglst[i]), taglst[i]);
                }
            },
            /*binary files*/
            reb: /.+?\.(jpeg|jpg|gif|png|woff|otf|ttf|bmp|wav)/i,
            /*text files*/
            ret: /.*?\.?(mimetype|txt|htm|html|xhtml|ncx|xml|css|smil|pls|opf|svg)/i,
            /* last file */
            relf: /(.*?\/)+(.+?)/gi
    }
  }
);
