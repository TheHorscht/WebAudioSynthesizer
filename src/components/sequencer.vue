<template>
  <div ref="container" :width="width" :height="height">
  <svg width="100%" height="100%">
    <rect x="0" y="0" width="100%" height="100%" fill="white" />
    <template v-for="i in 12">
      <rect x="0" :y="(i-1) * computedHeight / 12"
            width="65%" height="8.33%"
            fill="black" :key="'template'+i" v-if="[2, 4, 6, 9, 11].includes(i)"/>
    </template>
  </svg>
  <svg width="100%" height="100%">
    <rect v-for="i in 4" :key="'bgrect' + i"
          :x="(i-1) * (1/4) * 100 + '%'" width="25%" 
          y="0" height="100%"
          :class="(i-1) % 2 == 0 ? 'rect2' : 'rect3'" />
    <rect v-for="(note, i) in notes" :key="'note' + i"
          :x="Math.floor(i % 16) * (1 / 16) * 100 + '%'" :width="(1 / 16) * 100 + '%'"
          :y="Math.floor(i / 16) * (1 / 12) * 100 + '%'" :height="(1 / 12) * 100 + '%'"
          :fill="note === 1 ? 'red' : 'transparent'" stroke-width="0.3"
          class="rect"
          @click="click(i)" />
    <line v-if="playing"
          :x1="tickP * computedWidth" y1="0"
          :x2="tickP * computedWidth" y2="100%"
          stroke-width="1" stroke="yellow" />
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
      notes: Array(16*12).fill(0),
      position: 0,
      playing: true,
      totalTicks_: 16 * 16,
      computedWidth: 0,
      computedHeight: 0,
    }),
    mounted() {
      //this.update();
      const child = this.$refs.container;
      const observer = new MutationObserver(mutations => {
        let newWidth = parseInt(window.getComputedStyle(child).width, 10);
        newWidth -= 100;
        let newHeight = parseInt(window.getComputedStyle(child).height, 10);
        this.computedWidth = newWidth;
        this.computedHeight = newHeight;
      });

      observer.observe(child, { attributes: true, attributeFilter: ['style'] });
    },
    methods: {
      update() {
        this.position += 1;
        this.position %= this.totalTicks_;
        window.requestAnimationFrame(this.update);
      },
      click(noteIndex) {
        this.$set(this.notes, noteIndex, 1 - this.notes[noteIndex]);
      }
    },
    computed: {
      tickP: self => self.position / self.totalTicks_,
    }
}
</script>
<style lang="scss" scoped>
div {
  display: inline-grid;
  grid-template-columns: 100px auto;
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
.rect {
  stroke: #3c3434;
}
.rect2 {
  fill: #6d6966;
}
.rect3 {
  fill: #635e5a;
}
</style>
