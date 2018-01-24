<template>
<div class="ui floating message">
  <i class="close icon" @click="$this.emit('close')"></i>
  <div class="header">
    房屋資訊表：{{ type }} - {{ village }} ( {{results.length}} )
  </div>
  <div class="ui divider"></div>
  <div>
    <a class="ui label" @click="download">下載.csv(excel檔)</a>
    <sorttable ref="table" :data="results"
      head="地區 村莊 名稱 貢獻 用途 用途等級 格數 CP">
    </sorttable>
  </div>
  
</div>
</template>

<script>
function transpose(array) {
  var newArray = [],
      origArrayLength = array.length,
      arrayLength = array[0].length,
      i;
  for(i = 0; i < arrayLength; i++){
      newArray.push([]);
  };

  for(i = 0; i < origArrayLength; i++){
      for(var j = 0; j < arrayLength; j++){
          newArray[j].push(array[i][j]);
      };
  };
  return newArray
}
module.exports = {
  props: ["k"],
  data: ()=>({
    type: null,
    village: null,
    results: []
  }),
  methods: {
    update: function(type, village, villages, childrenlist, compact, static){
      this.type = type === 'all' ? '全部':type
      this.village = village === 'all' ? '全區域':village
      var a = [];
      for(var i in compact.houses){
        if(village === 'all' || compact.houses[i].location === village){
          var e = compact.houses[i]
          var b = [e.zone, e.location, e.title, e.cpoints];
          var c = []
          for(var type2 in e.usage){
            if(type === 'all' || type2 === type){
              var n = (static[type2]||[]).length?static[type2][e.usage[type2].level-1]:'　';
              var cp = n === '　' ? '　' : (n / e.cpoints).toFixed(3).replace(/([^.])0+$/,'$1')
              c.push([type2, e.usage[type2].level, n, cp])
            }
          }
          if(!c.length){
            continue
          }
          c = transpose(c)
          b = b.concat(c.map(function(e){return e.join('\n')}))
          a.push(b)
        }
      }
      this.results = a;
      if(this.$refs.table){
        this.$refs.table.update()
      }
      
      //$(this.$refs.table).tablesort()
    },
    download: function(){
      var head = [].map.call(this.$refs.table.querySelector("thead tr").children, function(e){
        return e.textContent
      })
      var s = head.join(',') + '\r\n' + this.results.map(function(e){
        return e.map(function(e){
          if(/\n/.test(e)) return '"' + e + '"';
          return e
        }).join(',')
      }).join('\r\n')
      var a = document.createElement('a')
      a.download = "list.csv"
      a.href = "data:application/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(s); //with BOM
      a.click()
    }
  },
  mounted: function(){
    this.$emit("init")
  }
}
</script>

<style>
.cpval-container {
  display: flex;
}
.cpval-content {
  flex: 1;
}
.info-table {
  white-space: pre-wrap;
}
</style>


