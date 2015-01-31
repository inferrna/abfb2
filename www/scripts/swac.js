define([], function(){
var lparts = {'en': 'eng', 'ru': 'rus', 'be': 'bel', 'fr': 'fra', 'wo': 'wol', 'it': 'ita', 'uk': 'ukr', 'de': 'deu', 'sp': 'spa', 'wu': 'wuu', 'ch': 'chi', 'nl': 'nld', 'ar': 'arb', 'ce': 'ces', 'po': 'por', 'cm': 'cmn', 'sr': 'srp', 'sw': 'swe'};
var swac = {"paths":["arb-balm-mohamed/ogg/","arb-balm-mustapha/ogg/","bel-balm-dasha/ogg/","bel-balm-igor/ogg/","bel-balm-julja/ogg/","ces-balm-ivana/ogg/","ces-balm-veronika/ogg/","ces-balm-veronika-num/ogg/","chi-balm-hsk1/ogg/","cmn-balm-congcong/ogg/","cmn-balm-hsk1/ogg/","cmn-caen-tan/ogg/","deu-balm-alexandra/ogg/","deu-balm-ulrike-verbs/ogg/","deu-wims-math/ogg/","deu-wims-num/ogg/","eng-balm-emmanuel/ogg/","eng-balm-judith/ogg/","eng-balm-judith-proverbs/ogg/","eng-balm-verbs/ogg/","eng-wcp-us/ogg/","eng-wims-mary/ogg/","eng-wims-mary-conversation/ogg/","eng-wims-mary-num/ogg/","fra-balm-conjug/ogg/","fra-balm-flora-expr/ogg/","fra-balm-flora-num/ogg/","fra-balm-frank/ogg/","fra-balm-tnitot/ogg/","fra-balm-voc/ogg/","fra-nallet-camille/ogg/","fra-nallet-caroline/ogg/","fra-nallet-christian/ogg/","fra-nallet-denise/ogg/","fra-nallet-marie/ogg/","fra-nallet-nicolas/ogg/","fra-nallet-odile/ogg/","fra-wims-lettres/ogg/","fra-wims-voc/ogg/","ita-balm-marta/ogg/","nld-balm-dorenda/ogg/","nld-balm-dorenda-num/ogg/","nld-balm-dorenda-proverbs/ogg/","nld-wcp/ogg/","pol-balm-yolande/ogg/","por-balm-izaias/ogg/","por-wims-num/ogg/","por-wims-voc/ogg/","rus-balm-voc/ogg/","rus-balm-voc-sakhno/ogg/","rus-nonfree/ogg/","spa-wims-octavio/ogg/","srp-balm-sasha/ogg/","swe-balm-num/ogg/","swe-balm-voc/ogg/","ukr-balm-galja/ogg/","ukr-balm-svitlana/ogg/","ukr-balm-svitlana-proverbs/ogg/","ukr-balm-zhenja/ogg/","wol-balm-voc/ogg/","wuu-balm-congcong/ogg/","wuu-balm-congcong-num/ogg/","wuu-tatoeba-congcong/ogg/"],"base":"http://packs.shtooka.net/"};
var worker = null;
return {
    lparts:lparts,
    swac:swac,
    init:function(lng, callback){
        worker = new Worker('scripts/swaclangs/'+lng+'.js');
        worker.onmessage = function(event) {
              callback(event.data);
        };
    },
    get:function(wrd){
        worker.postMessage(wrd);
    }
}
});
