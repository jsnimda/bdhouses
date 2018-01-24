var compact = fetch('compact.json').then(e=>e.json())
var static = fetch('static.json').then(e=>e.json())
Promise.all([compact,static]).then(function(r){
  compact = r[0]
  static = r[1]
  console.time(1)
  unify();
  console.timeEnd(1)
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
        sel: {}
      }
    } else {
      villages[village].children.push(id)
    }
  }
  for(var i in villages){
    calc_com(villages[i])
  }
}
function calc_com(item){
  var com = 1;
  item.children.forEach(function(id){
    if(!childrenlist[id].com) calc_com(childrenlist[id]);
    com = com*(childrenlist[id].com + 1)
  })
  item.com = com;
}


//==============================================

  var sample = [{
    cpoints: 3,
    n: 1,
    children: []
  },
  {
    cpoints: 5,
    n: 2,
    children: [{
      cpoints: 3,
      n: 2,
      children: [{
        cpoints: 8,
        n: 1,
        children: []
      }]
    },{
      cpoints: 5,
      n: 1,
      children: []
    }]
  }]

//==================================================

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

