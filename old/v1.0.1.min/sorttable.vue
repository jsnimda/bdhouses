<template>
  <table class="ui sortable celled table info-table unstackable" ref="table">
    <thead>
      <th v-for="(v,i) in head.split(' ')"
        :class="i === sortedIndex ? 'sorted '+sorted : ''"
        @click="sort(i)">{{v}}</th>
    </thead>
    <tbody>
      <tr v-for="(v,i) in data">
        <td v-for="(v,i) in v">{{v}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
module.exports = {
  props: ['data', 'head'],
  data: ()=>({
    sorted: null,
    sortedM: 0,
    sortedIndex: null,
  }),
  methods: {
    update: function(){
      this.sorted = null;
      this.sortedM = 0;
      sortedIndex = null;
    },
    sort: function(i){
      console.log(i)
      this.sorted = this.sorted === "ascending" ? "descending" : "ascending";
      this.sortedM = this.sorted === "ascending" ? 1 : -1;
      this.sortedIndex = i;
      var self = this;
      this.data.sort(function(a,b){
        return self.sortedM * (compare(a[i], b[i]))
      })
    }
  },
}
function compare(a,b){
  if(!isNaN(parseFloat(a))){
    return parseFloat(a)-parseFloat(b)
  } else {
    return a.localeCompare(b)
  }
}
</script>
