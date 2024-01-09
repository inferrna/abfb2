define(
    [],
  function(){
        if(!callbacks) {
            var callbacks = {};
        }
        return {
            register:function(module, funcname, func){
                if(!callbacks[module]) callbacks[module] = {};
                callbacks[module][funcname] = func;
            },
            exec:function(module, funcname){
                if(callbacks[module][funcname]===undefined) console.warn(callbacks);
                return callbacks[module][funcname];
            }
        }
  }
);
