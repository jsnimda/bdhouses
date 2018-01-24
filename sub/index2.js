var compact = fetch('compact.json').then(e=>e.json())
var static = fetch('static.json').then(e=>e.json())
Promise.all([compact,static]).then(function(r){
  compact = r[0]
  static = r[1]
  do_work();
})
var locations = {};
function do_work(){
  for(var i in compact.houses){
    var e = compact.houses[i]
    add_location(e.location, e)
  }
  for(var i in locations){
    locations[i] = build_tree(locations[i])
    locations[i].com = calc_total_possible_combinations(locations[i])
  }
}
function add_location(location, item){
  if(locations[location]){
    locations[location].push(item)
  }else {
    locations[location] = [item]
  }
}
function build_tree(items){
  var indexes = {}/*
  {
    --id--: {
      parents: [...] or null([]?)
      children: []
      item: {}
    }
  }
  */
  var a = []
  //create min_require (and required)
  var items_by_key = {}
  items.forEach(function(e){
    items_by_key[e.id] = e;
  })
  var creating = new Set();
  var created = new Set();
  items.forEach(function(e){
    create_min_require(e.id)
  })
  function create_min_require(id){
    if(created.has(id)){
      return;
    }
    if(creating.has(id)){
      throw new Error('infinite loop require')
    }
    creating.add(id)
    var item = items_by_key[id]
    if(item.require.length === 0){
      item.min_require = [];
      item.required = [];
      created.add(id);
      creating.delete(id);
      return;
    }
    //item.require > 1
    var required = new Set();
    item.require.forEach(function(parent_id){
      create_min_require(parent_id)
      items_by_key[parent_id].required.forEach(function(e){
        required.add(e);
      })
    })
    var min_require = [];
    item.require.forEach(function(parent_id){
      if(!required.has(parent_id)){
        min_require.push(parent_id)
      }
    })
    item.min_require = min_require;
    var thisrequired = min_require.slice(0)
    required.forEach(function(e){
      thisrequired.push(e)
    })
    item.required = thisrequired;
    created.add(id);
    creating.delete(id);
    return;
  }
  //---
  items.forEach(function(e){
    if(e.require.length){
      normalize(e)
    } else {
      a.push(normalize(e))
    }
  })
  function normalize(item){
    dopIndex(item.id)
    if(item.min_require.length > 1) console.log(item); //if noting on conosle, no ring tree node found
    item.min_require.forEach(function(id){
      dopIndex(id)
      indexes[item.id].parents.push(indexes[id])
      indexes[id].children.push(indexes[item.id])
    })
    indexes[item.id].item = item
    return indexes[item.id]
  }
  function dopIndex(id){
    if(!indexes[id]){
      createIndex(id)
    }
  }
  function createIndex(id){
    indexes[id] = {
      parents: [],
      children: [],
      item: null
    }
  }
  return a
}
function calc_total_possible_combinations(items){
  var com = 1;
  function calc(node){
    var com = 1;
    node.children.forEach(function(child){
      if(!child.com) calc(child);
      com = com*(child.com+1)
    })
    node.com = com;
  }
  items.forEach(function(child){
    if(!child.com) calc(child);
    com = com*(child.com+1)
  })
  return com;
}



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