define(
  [],
  function(){
    var opts_brd = document.getElementById('options');
    var datas = {
        Dict_srv: ['google', 'local'],
        local_ip: '',
        local_port: ''
    };
    opts_brd.textContent = '';
    var type;
    function create_select(obj, name, elements){
        var sel = document.createElement("select");
        var nm  = document.createElement("option");
        var br  = document.createElement("br");
        nm.textContent = name;
        nm.selected = 1;
        nm.disabled = 1;
        sel.appendChild(nm);
        for(var eln in elements){
            el = document.createElement("option");
            el.textContent = elements[eln];
            el.value = elements[eln];
            sel.appendChild(el);
        }
        obj.appendChild(sel);
        obj.appendChild(br);
    }
    function create_input(obj, name){
        var sel = document.createElement("label");
        var inp = document.createElement("input");
        var br  = document.createElement("br");
        sel.textContent = name;
        inp.id = name;
        inp.type = 'text';
        obj.appendChild(sel);
        obj.appendChild(inp);
        obj.appendChild(br);
    }
    function display(mode){
        opts_brd.style.display = mode;
    }
    for(var key in datas){
        type = typeof(datas[key]);
        console.log(type);
        if(type=="object") create_select(opts_brd, key, datas[key]);
        if(type=="string") create_input(opts_brd, key);
    }
    return{
            display:function(mode){
                display(mode);
            }
    };
  }
);
