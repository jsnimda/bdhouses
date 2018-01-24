var cver = "1.0.0";
var compact, static;
if(localStorage.getItem("cver") === cver){
  compact = Promise.resolve(JSON.parse(localStorage.getItem("compact")));
  static = Promise.resolve(JSON.parse(localStorage.getItem("static")));
} else {
  localStorage.setItem("cver", cver);
  compact = fetch('compact.json').then(function(e){
    e.clone().text().then(f=>localStorage.setItem("compact",f))
    return e.json()
  })
  static = fetch('static.json').then(function(e){
    e.clone().text().then(f=>localStorage.setItem("static",f))
    return e.json()
  })
}
//===

Promise.all([compact,static]).then(function(r){
  compact = r[0]
  static = r[1]
  console.time(1)
  unify();
  console.timeEnd(1)
  init();
})

/* Suppose no ring loop, todo
  villages: {
    --village name(location)--: {
      children: [id...],
      com: --number of possible combinations--, //<=== this do later
      sel: {}
    }
  }
  villages: {
    --village name(location)--: {
      children: [id...],
      com: --number of possible combinations--,
      sel: {
        倉庫: [
          {
            cpoints: ... (= all child + self)
            n: ... (= all child + self)
            sel: {} means no child
              or {
                --house id--: --cpoints--, ...
              }
          },...
        ]
      }
    }
  }
  childrenlist: {
    --house id--: {
      id: --,
      children: [id...],
      com: //
      sel: {
        ...
      }
    }
  }
*/
var childrenlist = {}
var villages = {};
var types = {}
var designs = {}
function unify(){
  var analysing = new Set();
  var all = {}; /* {
    --house id--: {
      required: [...] (=[up layer's required-s] + [parents])
      parents: [] (=[up layer] - [up layer's required-s])
      //children:[] //add after
    }
  } */
  var base = [];
  for(var i in compact.houses){
    analyse(compact.houses[i])
    childrenlist[i] = {
      id: i,
      children: [],
      sel: {}
    }
  }
  function analyse(house){
    if(all[house.id]){
      return;
    }
    if(analysing.has(house.id)){
      throw 'infinity loop occurred'
    }
    analysing.add(house.id);
    var o = {};
    all[house.id] = o;
    var uprequired = new Set();
    var parents = []
    house.require.forEach(function(id){
      analyse(compact.houses[id])
      all[id].required.forEach(function(id){
        uprequired.add(id)
      })
    })
    house.require.forEach(function(id){
      if(!uprequired.has(id)) parents.push(id);
    })

    var required = parents.slice(0)
    uprequired.forEach(function(id){
      required.push(id)
    })
    o.required = required
    o.parents = parents
    analysing.delete(house.id);
  }
  for(var i in all){
    all[i].parents.forEach(function(id){
      childrenlist[id].children.push(i)
    })
  }
  for(var i in all){
    if(all[i].parents.length === 0){
      add_village(compact.houses[i].location, i)
    }
  }
  //=== add village
  function add_village(village, id){
    if(!villages[village]){
      villages[village] = {
        children: [id],
        sel: {},
        types: {}
      }
    } else {
      villages[village].children.push(id)
    }
  }
  for(var i in villages){
    calc_com(villages[i])
  }
  //// add types
  for(var i in compact.houses){
    for(var type in compact.houses[i].usage){
      types[type] = true;
      villages[compact.houses[i].location].types[type] = true;
      //// add design
      if(!static[type]){
        compact.houses[i].usage[type].designs.forEach(function(e, i2){
          //e = ids, i2 = level - 1 
          e.forEach(function(e){
            add_design(e, i, type, i2 + 1)
          })
        })
      }
    }
  }
  function add_design(design_id, houses_id, type, level){
    if(!designs[design_id]) designs[design_id] = [];
    designs[design_id].push({
      id: houses_id,
      type: type,
      level: level
    })
  }
  types = Object.keys(types).sort()

}
function calc_com(item){
  var com = 1;
  item.children.forEach(function(id){
    if(!childrenlist[id].com) calc_com(childrenlist[id]);
    com = com*(childrenlist[id].com + 1)
  })
  item.com = com;
}


/*
sel: {
  倉庫: [
    {
      cpoints: ... (= all child + self)
      n: ... (= all child + self)
      sel: [{}] means no child
        or [{
          --house id--: --cpoints--, ...
        }]
    },...
  ]
}

*/
function calc(item, type){
  if(item.sel[type]){
    return;
  }
  /*
  item.sel[type] = [{ //self only
    cpoints: getcpoints(item.id),
    n: getcpoints(item.id, type),
    s: [{}]
    //
    s: {operator: multiply, operands: ...} // object.assign
    {operator: add, operands: ...}  //array.concat
  }];*/
  item.sel[type] = [];
  item.children.forEach(function(id){
    calc(childrenlist[id], type)
    var child_result = childrenlist[id].sel[type]
    item.sel[type] = combine(item.sel[type], child_result.map(function(e){
      return upwrap(e,id)}))
  })
  function combine(a,b){
    //return a*b + a + b, << minify
    var c = [];
    a.forEach(function(i){
      b.forEach(function(j){
        var o = {
          cpoints: i.cpoints + j.cpoints,
          n: i.n + j.n,
          s: {operator: 'multiply', operands: [i.s,j.s], com:com(i.s)*com(j.s)}
        }
        c.push(o)
      })
    })
    c = c.concat(a,b)
    //===filter and combine
    //for the same cpoints, choose the highest n
    //for the same cpoints, same n, combind s
    //for higher cpoints, n must increase
    c.sort(function(a,b){
      return (a.cpoints - b.cpoints) || (b.n - a.n)
    })
    var cpoints = -1;
    var n = -1;
    var d = []
    c.forEach(function(e){
      if(e.cpoints > cpoints){
        if(e.n > n){
          n = e.n
          d.push(e)
        }
        cpoints = e.cpoints;
      } else if (e.cpoints === cpoints && e.n === n){
        d[d.length - 1].s = {operator: 'add', operands: [d[d.length - 1].s, e.s], 
          com: com(d[d.length - 1].s)+com(e.s)}
      }
    })
    return d;
  }
  function com(s){
    return s.com || s.length;
  }
  function upwrap(b, id){
    var o = {};
    o[id] = b.cpoints
    return {
      cpoints: b.cpoints,
      n: b.n,
      s: [o]
    }
  }
  var self = { //self only
    cpoints: getcpoints(item.id),
    n: getn(item.id, type),
    s: [{}]
  }
  item.sel[type].forEach(function(e){
    e.cpoints += self.cpoints;
    e.n += self.n;
  })
  item.sel[type].unshift(self)
}
function getcpoints(id){
  if(!id) return 0;
  return compact.houses[id].cpoints || 0;
}
function getn(id, type){
  if(!id) return 0;
  return compact.houses[id].usage[type] ? static[type][compact.houses[id].usage[type].level-1] : 0;
}


//=== DOM
Vue.component('cpval', httpVueLoader('cpval.vue'))
Vue.component('search', httpVueLoader('search.vue'))
Vue.component('info', httpVueLoader('info.vue'))
Vue.component('sorttable', httpVueLoader('sorttable.vue'))
var glob = {
  zones: null,
  cpvals: [],
  types: [],
  results: [],


  s_village: "all"
}
var app;
var DOMOK = trig();
var DataOK = trig();
function trig(){
  var b;
  var a = new Promise(function(r){b = r})
  a.r = b;
  return a;
}
addEventListener("DOMContentLoaded", DOMOK.r);

function init(){
  DataOK.r();

}
Promise.all([DOMOK, DataOK]).then(function(){
  var zones = {};
  for(var i in villages){
    addzone(compact.houses[villages[i].children[0]].zone, i)
  }
  function addzone(zone, village){
    if(!zones[zone]) zones[zone] = [];
    zones[zone].push(village)
  }
  //sort
  for(var i in zones){
    zones[i].sort();
  }
  var azones = [];
  Object.keys(zones).sort().forEach(function(e){
    azones.push({zone: e, villages: zones[e]})
  })
  glob.zones = azones;
  //
  for(var i in static){
    if(static[i] && static[i].length) glob.cpvals.push(i);
  }
  glob.scp = glob.cpvals[0];
  //types
  glob.types = types;

  app = new Vue({
    el: '#app',
    data: glob,
    methods: {
      search: function(){
        click_search(this.$refs.search.value)
      },
      calcCP: function(){
        calcCP(this.$refs.cpvalue.value, this.$refs.village.value, true)
      },
      hasType: function(type, village){
        return villages[village].types[type] === true;
      },
      listInfo: function(){
        listInfo(this.$refs.types.value, this.$refs.village.value, true)
      }
    }
  });
  
  var source = {};
  var current_results;
  for(var i in compact.designs){
    if(!source[compact.designs[i]]) source[compact.designs[i]] = [];
    source[compact.designs[i]].push(i)
  }
  $("#search").search({
    source: Object.keys(source).map(function(e){return {title:e}}),
    searchFields: [
      'title',
    ],
    onSelect: function(e){
      var item = e.title;
      click_search(item);
    },
    /*onResults: function(results){
      current_results = results
    }*/
  })
  function click_search(title){
    title = title || app.$refs.search.value;
    search(title, source[title] || [], app.$refs.village.value, true)
  }

  if(glob.results.length === 0){
    calcCP('倉庫', '卡爾佩恩首都');
  }
})
//=== END init
var unique_counter = 0;
function search(title, design_ids, village, use_existence, target){
  var matches = []
  design_ids.forEach(function(id){
    designs[id].forEach(function(e){
      if(village === 'all'){
        matches.push(e)
      } else if(compact.houses[e.id].location === village) {
        matches.push(e)
      }
    })
  })
  matches = matches.map(function(e){
    return [/*e.id,*/ compact.houses[e.id].title, e.type, e.level, compact.houses[e.id].usage[e.type].level,
    compact.houses[e.id].cpoints]
  })
  matches.sort(function(a,b){
    return (a[4] - b[4]) || (b[3] - a[3]) || a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) || a[2] - b[2]
  })

  //glob.results.unshift
  if(use_existence){
    if(target){
      var i = glob.results.indexOf(target);
      if(i !== -1){
        send_update(getComponent(glob.results[i].key))
        return
      }
    }
    var i = 0;
    while(glob.results[i] && glob.results[i].is !== "search") i++;
    if(i < glob.results.length){
      send_update(getComponent(glob.results[i].key))
      return
    }
  }
  //add
  glob.results.unshift({
    is: "search",
    key: unique_counter++,
    init: function(k){
      send_update(getComponent(k))
    }
  })

  function send_update(component){
    //!! village: all
    component.update(title, matches)
  }
}
function calcCP(type, village, use_existence, target){
  if(village !== "all"){
    if(!villages[village].sel[type]) calc(villages[village],type);
  } else {
    for(var i in villages){
      if(!villages[i].sel[type]) calc(villages[i],type);
    }
  }
  
  //glob.results.unshift
  if(use_existence){
    if(target){
      var i = glob.results.indexOf(target);
      if(i !== -1){
        send_update(getComponent(glob.results[i].key))
        return
      }
    }
    var i = 0;
    while(glob.results[i] && glob.results[i].is !== "cpval") i++;
    if(i < glob.results.length){
      send_update(getComponent(glob.results[i].key))
      return
    }
  }
  //add
  glob.results.unshift({
    is: "cpval",
    key: unique_counter++,
    init: function(k){
      send_update(getComponent(k))
    }
  })

  function send_update(component){
    //!! village: all
    component.update(type, village, villages, childrenlist, compact, static, CanvasJS)
  }
}
function listInfo(type, village, use_existence, target){
  if(use_existence){
    if(target){
      var i = glob.results.indexOf(target);
      if(i !== -1){
        send_update(getComponent(glob.results[i].key))
        return
      }
    }
    var i = 0;
    while(glob.results[i] && glob.results[i].is !== "info") i++;
    if(i < glob.results.length){
      send_update(getComponent(glob.results[i].key))
      return
    }
  }
  //add
  glob.results.unshift({
    is: "info",
    key: unique_counter++,
    init: function(k){
      send_update(getComponent(k))
    }
  })

  function send_update(component){
    //!! village: all
    component.update(type, village, villages, childrenlist, compact, static)
  }
}
function getComponent(key){
  for(var i = 0; i < app.$refs.results.length; i++){
    if(app.$refs.results[i].k === key) return app.$refs.results[i];
  }
}
function close_btn(){
  $('.message .close')
  .on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade')
    ;
  })
;
}
/*
function calcCP(cpval){
  console.time(2)
  cpval.d.village = village
  cpval.d.type = type

  if(!villages[village].sel[type]) calc(villages[village],type);

  console.timeEnd(2)
  var a = [];
  villages['卡爾佩恩首都'].sel.倉庫.forEach(function(e){
    if(e.n > 192){
      return
    }
    a.push({x:e.cpoints,y:((e.n!==0)?e.n/e.cpoints:0)})
  })
  console.log(a)

  var limit = 1000;

  var y = 0;
  var data = [];
  var dataSeries = { type: "line" };
  var dataPoints = a;
  dataSeries.dataPoints = dataPoints;
  data.push(dataSeries);        

  var chart = new CanvasJS.Chart(cpval.$refs.chart, {
    animationEnabled: true,
    zoomEnabled: true,
    title:{
      text: "Try Zooming and Panning" 
    },
    data: data  // random generator below
  });
  chart.render();
}
*/
function time(fn){
  console.time('fn')
  fn()
  console.timeEnd('fn')
}

