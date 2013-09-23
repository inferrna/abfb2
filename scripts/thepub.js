define(['jsepub', 'jsinflate', 'jsunzip', 'stuff'],
function(jsepub, jsinflate, jsunzip, stuff){
    var epub = null;
    var srlzr = new XMLSerializer();
    var xsltp = new XSLTProcessor();
    var parsr = new DOMParser();
    console.log(unescape(stuff.tocxsl.replace(/&quot;/g,'"')));
    xsltp.importStylesheet(parsr.parseFromString(stuff.tocxsl.replace(/&quot;/g,'"'), 'text/xml'));
    var evo = document.createElement("br");
    var got_book_ev = new Event('got_book');
    function load_jsepub(file){
        var Reader = new FileReader();
        Reader.onload = function(evt) {
            console.log("Load input file");
            proceedepub(evt.target.result);
        };
        Reader.readAsBinaryString(file);
    }
    function proceedepub(epubFile){
        // Use HTML5 files or download via XHR.
        epub = new JSEpub(epubFile);
        epub.processInSteps(function (step, extras) {
                var msg;
                if (step === 1) {
                    msg = "Unzipping";
                } else if (step === 2) {
                    msg = "Uncompressing " + extras;
                } else if (step === 3) {
                    msg = "Reading OPF";
                } else if (step === 4) {
                    msg = "Post processing";
                } else if (step === 5) {
                    msg = "Finishing";
                    console.log(msg);
                    evo.dispatchEvent(got_book_ev);
                }
                // Render the "msg" here.
            });
    }
    function get_indexed_page(index){
        if(index>-1){
            var spine = epub.opf.spine[index];
            var href = epub.opf.manifest[spine]["href"];
            var doc = epub.files[href];
            var html = srlzr.serializeToString(doc);
            return html;//decodeURIComponent( escape(resultDocument) ));
        }else{
            var toc = epub.toc;
            var contents = xsltp.transformToFragment(toc,document);
            return contents;
        }
        //console.log(contents);
    }
    return {
             load:function(file, lib) {
                        if(lib==='jsepub') load_jsepub(file);
             },
             get_page:function(index){
                     return get_indexed_page(index);
             },
             evo:evo
    }
}
);
