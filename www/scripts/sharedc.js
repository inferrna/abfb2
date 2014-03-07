define(
    [],
  function(){
        if(!callbacks) {
            var callbacks = {};
            console.log("init sharedf. must be only one");//NFP
        }
        return {
            register:function(module, funcname, func){
                console.log("register on "+module+" "+funcname+":");//NFP
                if(!callbacks[module]) callbacks[module] = {};
                callbacks[module][funcname] = func;
                console.log(callbacks[module][funcname]);//NFP
            },
            exec:function(module, funcname){
                console.log("exec called on "+module+" "+funcname+":");//NFP
                console.log(callbacks[module][funcname]);//NFP
                if(callbacks[module][funcname]===undefined) console.log(callbacks);
                return callbacks[module][funcname];
            }
        }
  }
);
