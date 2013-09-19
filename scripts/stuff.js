define(
    [],
  function(){
        return {
                 pick:function(arg, def) {
                            return (typeof arg == 'undefined' ? def : arg);
                 },
                 get_type:function(obj){
                         Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/,"$1").toLowerCase();
                 }
        }
  }
);
