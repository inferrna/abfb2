define(
  [],
  function(){
    var opts_brd = document.getElementById('options');
    opts_brd.textContent = '';
    var type;
    var datas = {
        dict_src: [['google', 'local', 'socket'], "Select dictionary source"],
        socket_host: ['192.168.0.2', "dictd host"],
        socket_port: ['2628', "dictd port"],
        file: ['', ""]
    };
    var values = null;
    //var winstyle = element.currentStyle || window.getComputedStyle(element, null);
    function create_select(obj, name, elements, key){
        var sel = document.createElement("select");
        var nm  = document.createElement("option");
        var br  = document.createElement("br");
        nm.textContent = name;
        nm.selected = 1;
        nm.disabled = 1;
        sel.appendChild(nm);
        sel.id = key;
        for(var eln in elements){
            var el = document.createElement("option");
            el.textContent = elements[eln];
            el.value = elements[eln];
            sel.appendChild(el);
        }
        obj.appendChild(sel);
        obj.appendChild(br);
    }
    function create_input(obj, name, value, key){
        var sel = document.createElement("label");
        var inp = document.createElement("input");
        var br  = document.createElement("br");
        sel.textContent = name;
        inp.id = key;
        if(key==="file") inp.type = 'file';
        else inp.type = 'text';
        inp.value = value;
        obj.appendChild(sel);
        obj.appendChild(inp);
        obj.appendChild(br);
    }
    function display(mode){
        opts_brd.style.display = mode;
    }
    function get_config(){
        values = {};
        for(var key in datas){
            //type = typeof(datas[key][0]);
            values[key] = document.getElementById(key).value;
        }
        return values;
    }
    for(var key in datas){
        type = typeof(datas[key][0]);
        console.log(type);
        if(type=="object") create_select(opts_brd, datas[key][1], datas[key][0], key);
        if(type=="string") create_input(opts_brd, datas[key][1], datas[key][0], key);
    }
    var but = document.createElement("input");
    but.value = "Click_me";
    but.type = "button";
    opts_brd.appendChild(but);
    var toc = document.createElement("div");
    toc.id = "toc";
    opts_brd.appendChild(toc);
    //get_config();
    //console.log("Values is", values);
    return{
            display:function(mode){
                display(mode);
            },
            config:function(){
                if(values===null) return get_config();
                else return values;
            },
            bookfile:function(){
                return document.getElementById('file').files[0];
            },
            button:function(){
                return but;
            }
    };
  }
);
