<template>
<div class="ui floating message">
  <i class="close icon" @click="$emit('close')"></i>
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

<script>function transpose(t){var e,n=[],o=t.length,a=t[0].length;for(e=0;e<a;e++)n.push([]);for(e=0;e<o;e++)for(var l=0;l<a;l++)n[l].push(t[e][l]);return n}module.exports={props:["k"],data:()=>({type:null,village:null,results:[]}),methods:{update:function(t,e,n,o,a,l){this.type="all"===t?"全部":t,this.village="all"===e?"全區域":e;var s=[];for(var r in a.houses)if("all"===e||a.houses[r].location===e){var i=a.houses[r],u=[i.zone,i.location,i.title,i.cpoints],c=[];for(var h in i.usage)if("all"===t||h===t){var p=(l[h]||[]).length?l[h][i.usage[h].level-1]:"　",f="　"===p?"　":(p/i.cpoints).toFixed(3).replace(/([^.])0+$/,"$1");c.push([h,i.usage[h].level,p,f])}if(!c.length)continue;c=transpose(c),u=u.concat(c.map(function(t){return t.join("\n")})),s.push(u)}this.results=s,this.$refs.table&&this.$refs.table.update()},download:function(){var t=[].map.call(this.$refs.table.querySelector("thead tr").children,function(t){return t.textContent}).join(",")+"\r\n"+this.results.map(function(t){return t.map(function(t){return/\n/.test(t)?'"'+t+'"':t}).join(",")}).join("\r\n"),e=document.createElement("a");e.download="list.csv",e.href="data:application/csv;charset=utf-8,%EF%BB%BF"+encodeURIComponent(t),e.click()}},mounted:function(){this.$emit("init")}};
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


