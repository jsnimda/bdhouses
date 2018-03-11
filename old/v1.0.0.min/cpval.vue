<template>
<div class="ui floating message" id="cpval">
  <i class="close icon" @click="$emit('close')"></i>
  <div class="header">
    CP值：{{type}} - {{village}}
  </div>
  <div class="ui divider"></div>
  <div class="cpval-container">
    <div class="cpval-content">
      <div class="ui label highest">最高CP值</div>
      <a class="ui label" @click="rows = rows.slice(0,1)" v-show="village!=='全區域'">清除</a>
      <a class="ui label" @click="show_all()" v-show="village!=='全區域'">List all</a>
      <table class="ui celled table">
        <thead>
          <tr>
            <th class="collapsing">貢獻</th>
            <th class="collapsing">格數</th>
            <th class="collapsing">CP值</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v,i) in rows" :key="i">
            <td>{{v.cpoints}}</td><td>{{v.n}}</td><td>{{((v.n!==0)?v.n/v.cpoints:0).toFixed(3).replace(/([^.])0+$/,'$1')}}</td>
            <td>
              <template v-for="(v2,i2) in v.houses">{{v2}}<br v-if="i2!==v.houses.length-1"></template>
              <template v-if="v.com > 1"><br>　　　（總共有 {{v.com}} 種房屋組合）</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="cpval-chart" ref="chart" style="height: 300px; width: 542px; max-width: 100%;"
      @click="click_canvas()" v-show="village!=='全區域'"></div>
  </div>
  
</div>
</template>

<script>module.exports={props:["k"],data:()=>({type:null,village:null,rows:[],current_pointing:null,click_canvas:function(){},show_all:function(){}}),methods:{update:function(n,t,r,o,e,a,s){var c=this;if(this.type=n,this.village="all"===t?"全區域":t,this.rows=[],"all"===t){var u=[];for(i in r){var p=0,l=0,d=null;r[i].sel[n].forEach(function(n){if(!(n.n>192)){var t=0!==n.n?n.n/n.cpoints:0;t>p?(p=t,l=n.cpoints,d=n):t===p&&n.cpoints>l&&(l=n.cpoints,d=n)}}),u.push({village:i,cpitem:d})}return u.sort(function(n,t){n=n.cpitem,t=t.cpitem;var r=0!==n.n?n.n/n.cpoints:0;return(0!==t.n?t.n/t.cpoints:0)-r||t.n-n.n}),void u.forEach(function(n){h(n.cpitem)})}this.click_canvas=function(){h(v(c.current_pointing,r[t].sel[n]))},this.show_all=function(){var o=0,i=function(){h(r[t].sel[n][o]),++o<r[t].sel[n].length&&r[t].sel[n][o].n<192&&setTimeout(i,1)};i()};u=[];var f=[];p=0,l=0,d=null;r[t].sel[n].forEach(function(n,t,r){if(!(n.n>192)){var o=0!==n.n?n.n/n.cpoints:0;o>p?(p=o,l=n.cpoints,d=n):o===p&&n.cpoints>l&&(l=n.cpoints,d=n),u.push({x:n.cpoints,y:o}),f.push({x:n.cpoints,y:n.n,dx:t-1<0?0:n.cpoints-r[t-1].cpoints,dy:t-1<0?0:n.n-r[t-1].n})}});function h(t){c.rows.push({cpoints:t.cpoints,cp:t.cp,n:t.n,houses:function(t){function r(n){return Array.isArray(n)?n.length?n[0]:{}:"multiply"===n.operator?Object.assign({},r(n.operands[0]),r(n.operands[1])):"add"===n.operator?r(n.operands[0]):void 0}var i={};return a=function t(e,a){var s=[];for(var c in e){var u=o[c].sel[n],p=v(e[c],u),l=r(p.s);a&&(i[s.length]=p),s.push(c),s=s.concat(t(l))}return s}(r(t.s),!0),s=i,a.map(function(n,t){return(s?t in s?"":"　":"")+e.houses[n].title+(s&&t in s?"　　貢"+s[t].cpoints+" 格"+s[t].n+", CP: "+(0!==s[t].n?s[t].n/s[t].cpoints:0).toFixed(3).replace(/([^.])0+$/,"$1"):"")});var a,s}(t),com:function(t){if(t.com)return t.com;t.com=function t(r){if(Array.isArray(r)){var i=1;return r.forEach(function(t){for(var r in t)i*=function(t){if(t.com)return t.com;t.com=function t(r){if(Array.isArray(r)){var i=1;return r.forEach(function(t){for(var r in t)i*=m(v(t[r],o[r].sel[n]))}),i}return"add"===r.operator?t(r.operands[0])+t(r.operands[1]):t(r.operands[0])*t(r.operands[1])}(t.s);return t.com}(v(t[r],o[r].sel[n]))}),i}return"add"===r.operator?t(r.operands[0])+t(r.operands[1]):t(r.operands[0])*t(r.operands[1])}(t.s);return t.com}(t)})}function m(t){if(t.com){return t.com}t.com=r(t.s);function r(t){if(Array.isArray(t)){var i=1;t.forEach(function(t){for(var r in t){i=i*m(v(t[r],o[r].sel[n]))}});return i}else{if(t.operator==="add"){return r(t.operands[0])+r(t.operands[1])}else{return r(t.operands[0])*r(t.operands[1])}}}return t.com}function v(n,t){for(var r=0;r<t.length;r++)if(n===t[r].cpoints)return t[r]}new s.Chart(this.$refs.chart,{animationEnabled:!1,zoomEnabled:!0,axisX:{title:"貢獻"},axisY:{title:"格數"},axisY2:{title:"CP"},title:{text:""},toolTip:{shared:!0,contentFormatter:function(n){return c.current_pointing=n.entries[0].dataPoint.x,"貢獻："+n.entries[0].dataPoint.x+" ( +"+n.entries[0].dataPoint.dx+" )<br>格數："+n.entries[0].dataPoint.y+" ( +"+n.entries[0].dataPoint.dy+" )<br>CP："+n.entries[1].dataPoint.y.toFixed(3).replace(/([^.])0+$/,"$1")+"<br>"}},data:[{type:"line",showInLegend:!0,name:"格數",dataPoints:f,cursor:"pointer"},{type:"line",axisYType:"secondary",showInLegend:!0,name:"CP",dataPoints:u,cursor:"pointer"}]}).render(),h(d)}},mounted:function(){this.$emit("init")}};
</script>

<style>
.cpval-container {
  display: flex;
}
.cpval-content {
  flex: 1;
}
.cpval-content:not(.show-all) table tbody tr:first-child, .ui.label.highest{
  background-color: yellow;
}
</style>


