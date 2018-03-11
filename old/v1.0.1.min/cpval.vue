<template>
<div class="ui floating message cpval" id="cpval">
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
      <table class="ui celled table unstackable">
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
    <div class="cpval-chart-control" v-show="village!=='全區域'">
      <input type="range" min="0" max="1000" value="500" @input="control_chart($event.target.value)">
      <button class="circular ui icon mini button" @click="click_canvas()"><i class="checkmark icon"></i></button>
    </div>
    <div class="cpval-chart" ref="chart" style=""
      @click="click_canvas()" v-show="village!=='全區域'"></div>
  </div>
  
</div>
</template>

<script>module.exports={props:["k"],data:()=>({type:null,village:null,rows:[],current_pointing:null,click_canvas:function(){},show_all:function(){}}),methods:{update:function(n,t,r,e,o,a,s){var c=this;if(this.type=n,this.village="all"===t?"全區域":t,this.rows=[],"all"===t){var u=[];for(i in r){var l=0,p=0,d=null;r[i].sel[n].forEach(function(n){if(!(n.n>192)){var t=0!==n.n?n.n/n.cpoints:0;t>l?(l=t,p=n.cpoints,d=n):t===l&&n.cpoints>p&&(p=n.cpoints,d=n)}}),u.push({village:i,cpitem:d})}return u.sort(function(n,t){n=n.cpitem,t=t.cpitem;var r=0!==n.n?n.n/n.cpoints:0;return(0!==t.n?t.n/t.cpoints:0)-r||t.n-n.n}),void u.forEach(function(n){h(n.cpitem)})}this.click_canvas=function(){null!=c.current_pointing&&h(m(c.current_pointing,r[t].sel[n]))},this.show_all=function(){var e=0,o=function(){h(r[t].sel[n][e]),++e<r[t].sel[n].length&&r[t].sel[n][e].n<192&&setTimeout(o,1)};o()};u=[];var f=[];l=0,p=0,d=null;r[t].sel[n].forEach(function(n,t,r){if(!(n.n>192)){var e=0!==n.n?n.n/n.cpoints:0;e>l?(l=e,p=n.cpoints,d=n):e===l&&n.cpoints>p&&(p=n.cpoints,d=n),u.push({x:n.cpoints,y:e}),f.push({x:n.cpoints,y:n.n,dx:t-1<0?0:n.cpoints-r[t-1].cpoints,dy:t-1<0?0:n.n-r[t-1].n})}});function h(t){c.rows.push({cpoints:t.cpoints,cp:t.cp,n:t.n,houses:function(t){function r(n){return Array.isArray(n)?n.length?n[0]:{}:"multiply"===n.operator?Object.assign({},r(n.operands[0]),r(n.operands[1])):"add"===n.operator?r(n.operands[0]):void 0}var i={};return a=function t(o,a){var s=[];for(var c in o){var u=e[c].sel[n],l=m(o[c],u),p=r(l.s);a&&(i[s.length]=l),s.push(c),s=s.concat(t(p))}return s}(r(t.s),!0),s=i,a.map(function(n,t){return(s?t in s?"":"　":"")+o.houses[n].title+(s&&t in s?"　　貢"+s[t].cpoints+" 格"+s[t].n+", CP: "+(0!==s[t].n?s[t].n/s[t].cpoints:0).toFixed(3).replace(/([^.])0+$/,"$1"):"")});var a,s}(t),com:function(t){if(t.com)return t.com;t.com=function t(r){if(Array.isArray(r)){var o=1;return r.forEach(function(t){for(var r in t)o*=function(t){if(t.com)return t.com;t.com=function t(r){if(Array.isArray(r)){var o=1;return r.forEach(function(t){for(var r in t)o*=v(m(t[r],e[r].sel[n]))}),o}return"add"===r.operator?t(r.operands[0])+t(r.operands[1]):t(r.operands[0])*t(r.operands[1])}(t.s);return t.com}(m(t[r],e[r].sel[n]))}),o}return"add"===r.operator?t(r.operands[0])+t(r.operands[1]):t(r.operands[0])*t(r.operands[1])}(t.s);return t.com}(t)})}function v(t){if(t.com){return t.com}t.com=r(t.s);function r(t){if(Array.isArray(t)){var o=1;t.forEach(function(t){for(var r in t){o=o*v(m(t[r],e[r].sel[n]))}});return o}else{if(t.operator==="add"){return r(t.operands[0])+r(t.operands[1])}else{return r(t.operands[0])*r(t.operands[1])}}}return t.com}function m(n,t){for(var r=0;r<t.length;r++)if(n===t[r].cpoints)return t[r]}new s.Chart(this.$refs.chart,{animationEnabled:!1,zoomEnabled:!0,axisX:{title:"貢獻"},axisY:{title:"格數"},axisY2:{title:"CP"},title:{text:""},toolTip:{shared:!0,contentFormatter:function(n){return c.current_pointing=n.entries[0].dataPoint.x,"貢獻："+n.entries[0].dataPoint.x+" ( +"+n.entries[0].dataPoint.dx+" )<br>格數："+n.entries[0].dataPoint.y+" ( +"+n.entries[0].dataPoint.dy+" )<br>CP："+n.entries[1].dataPoint.y.toFixed(3).replace(/([^.])0+$/,"$1")+"<br>"}},data:[{type:"line",showInLegend:!0,name:"格數",dataPoints:f,cursor:"pointer"},{type:"line",axisYType:"secondary",showInLegend:!0,name:"CP",dataPoints:u,cursor:"pointer"}]}).render(),h(d)},control_chart:function(n){var t=this.$refs.chart.querySelectorAll(".canvasjs-chart-canvas")[1].getBoundingClientRect();this.$refs.chart.querySelectorAll(".canvasjs-chart-canvas")[1].dispatchEvent(new MouseEvent("mousemove",{view:window,bubbles:!0,cancelable:!0,clientX:t.left+t.width*n/1e3,clientY:t.top+t.height/2}))}},mounted:function(){this.$emit("init")}};
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


