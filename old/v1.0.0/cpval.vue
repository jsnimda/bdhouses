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

<script>
module.exports = {
  props: ["k"],
  data: ()=>({
    type: null,
    village: null,
    rows: [],
    current_pointing: null,
    click_canvas: function(){},
    show_all: function(){}
  }),
  methods: {
    update: function(type, village, villages, childrenlist, compact, static, CanvasJS){
      var self = this;
      this.type = type;
      this.village = village==="all"?"全區域":village;
      this.rows = []
      if(village==="all"){
        var a = []
        for(i in villages){
          var maxcp = 0;
          var cpcpoints = 0;
          var cpitem = null;
          villages[i].sel[type].forEach(function(e){
            if(e.n > 192){
              return
            }
            var cp = ((e.n!==0)?e.n/e.cpoints:0)
            if(cp > maxcp){
              maxcp = cp;
              cpcpoints = e.cpoints;
              cpitem = e
            } else if (cp === maxcp && e.cpoints > cpcpoints){
              cpcpoints = e.cpoints;
              cpitem = e
            }
          })
          a.push({village: i, cpitem: cpitem})
        }
        a.sort(function(a,b){
          a = a.cpitem
          b = b.cpitem
          var acp = ((a.n!==0)?a.n/a.cpoints:0)
          var bcp = ((b.n!==0)?b.n/b.cpoints:0)
          return (bcp-acp) || (b.n - a.n)
        })
        a.forEach(function(e){push(e.cpitem)})
        return;
      }

      this.click_canvas = function(){
        push(getitem(self.current_pointing, villages[village].sel[type]))
      }
      this.show_all = function(){
        var i = 0;
        var fn = function(){
          push(villages[village].sel[type][i])
          i++
          if(i < villages[village].sel[type].length && villages[village].sel[type][i].n < 192){
            setTimeout(fn, 1)
          }
        }
        fn()
      }
      //draw chart
      var a = [];
      var b = [];
      var maxcp = 0;
      var cpcpoints = 0;
      var cpitem = null;
      villages[village].sel[type].forEach(function(e, i, arr){
        if(e.n > 192){
          return
        }
        var cp = ((e.n!==0)?e.n/e.cpoints:0)
        if(cp > maxcp){
          maxcp = cp;
          cpcpoints = e.cpoints;
          cpitem = e
        } else if (cp === maxcp && e.cpoints > cpcpoints){
          cpcpoints = e.cpoints;
          cpitem = e
        }
        a.push({x:e.cpoints,y:cp})
        b.push({x:e.cpoints,y:e.n, dx: (i-1<0)?0:(e.cpoints - arr[i-1].cpoints),
          dy: (i-1<0)?0:(e.n - arr[i-1].n)})
      })

      var data = [{ type: "line", dataPoints: a}, { type: "line", dataPoints: b}];

      var chart = new CanvasJS.Chart(this.$refs.chart, {
        animationEnabled: false,
        zoomEnabled: true,
        axisX:{
          title: "貢獻"
        },
        axisY:{
          title: "格數",
        },
        axisY2:{
          title: "CP",
        },
        title:{
          text: "" 
        },
        toolTip: {
          shared: true,
          contentFormatter: function ( e ) {
            self.current_pointing = e.entries[0].dataPoint.x;
            return "貢獻：" +  e.entries[0].dataPoint.x + " ( +"+e.entries[0].dataPoint.dx+" )<br>"
            +"格數：" +  e.entries[0].dataPoint.y + " ( +"+e.entries[0].dataPoint.dy+" )<br>"
            +"CP：" +  e.entries[1].dataPoint.y.toFixed(3).replace(/([^.])0+$/,'$1') + "<br>";  
          }
        },
        data: [{
          type: "line",
		      showInLegend: true,
		      name: "格數",
          dataPoints: b,
          cursor: "pointer",	
          //click: chartOnclick,
        },{
          type: "line",  
		      axisYType: "secondary",          
		      showInLegend: true,
		      name: "CP",
          dataPoints: a,
          cursor: "pointer",	
          //click: chartOnclick,
        }]  // random generator below
      });
      chart.render();

      function chartOnclick(x){
        x = x.dataPoint.x;
        push(getitem(x,villages[village].sel[type]))
      }

      push(cpitem)
      function push(cpitem){
        self.rows.push({
          cpoints: cpitem.cpoints,
          cp: cpitem.cp,
          n: cpitem.n,
          houses: gethouses(cpitem),
          com: calcCom(cpitem)
        })
      }
      function calcCom(cpitem){
        if(cpitem.com){
          return cpitem.com
        }
        cpitem.com = cc(cpitem.s)
        function cc(s){
          if (Array.isArray(s)){
            var com = 1;
            s.forEach(function(e){
              for(var i in e){
                com = com * calcCom(getitem(e[i], childrenlist[i].sel[type]))
              }
            })
            return com;
          } else {
            if(s.operator === "add"){
              return cc(s.operands[0]) + cc(s.operands[1])
            } else { //multiple
              return cc(s.operands[0]) * cc(s.operands[1])
            }
          }
        }

        return cpitem.com;
      }
      function gethouses(cpitem){ //return arr
        var s = cpitem.s;
        var o = p(s);
        function p(s){
          if(Array.isArray(s)){
            if(s.length){
              return s[0]
            } else {
              return {};
            }
          }
          if(s.operator === "multiply"){ //suppose 2 items only
            return Object.assign({}, p(s.operands[0]),p(s.operands[1]))
          }
          if(s.operator === "add"){
            return p(s.operands[0])
          }
        }
        var indents = {}
        var a = q(o, true)
        function q(o, record_indents){
          var a = [];
          for(var i in o){
            var seltype = childrenlist[i].sel[type];
            var item = getitem(o[i], seltype)
            var o2 = p(item.s)
            if(record_indents){
              indents[a.length] = item
            }
            a.push(i)
            a = a.concat(q(o2))
          }
          return a
        }
        return totitle(a, indents)
      }
      function totitle(ids, indent_leadings){
        return ids.map(function(e, i){return (indent_leadings?(i in indent_leadings?'':'　'):'') + compact.houses[e].title
         + (indent_leadings?(i in indent_leadings?('　　貢'+indent_leadings[i].cpoints+' 格'+indent_leadings[i].n+', CP: '+
         ((indent_leadings[i].n!==0)?indent_leadings[i].n/indent_leadings[i].cpoints:0).toFixed(3).replace(/([^.])0+$/,'$1')):''):'')})
      }
      function getitem(cpoints, seltype){
        for(var i = 0; i < seltype.length; i++){
          if(cpoints === seltype[i].cpoints){
            return seltype[i];
          }
        }
      }
    }
  },
  mounted: function(){
    this.$emit("init")
  },
}
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


