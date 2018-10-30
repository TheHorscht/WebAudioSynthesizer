<template>
  <div :width="width" :height="height">
  <svg width="100%" height="100%">
    <rect v-for="(note, i) in notes" :key="'note' + i"
          :x="Math.floor(i % 16) * (1 / 16) * 100 + '%'" :width="(1 / 16) * 100 + '%'"
          :y="Math.floor(i / 16) * (1 / 12) * 100 + '%'" :height="(1 / 12) * 100 + '%'"
          :fill="note === 1 ? 'red' : 'black'" stroke="red" stroke-width="0.3"
          @click="click(i)" />
  </svg>
  </div>
</template>
<script>
export default {
    name: 'VueSequencer',
    props: {
      width: {
        type: Number,
        default: 400,
      },
      height: {
        type: Number,
        default: 200,
      },
    },
    data: () => ({
      notes: Array(16*12).fill(0)
    }),
    methods: {
      click(noteIndex) {
        this.$set(this.notes, noteIndex, 1 - this.notes[noteIndex]);
      }
    }
}
</script>
<style lang="scss" scoped>
line {
  stroke:black;
  stroke-width: 1;
}
div {
  resize: both;
  overflow: scroll;
  
  min-width: 80px;
  min-height: 80px;
  max-width: 800px;
  max-height: 800px;
}
body {
  height: 100%;
}
</style>



