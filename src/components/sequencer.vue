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
          :class="(i-1) % 2 == 0 ? 'bg1' : 'bg2'" />
    <rect v-for="(note, i) in 12*16" :key="'emptyrect' + i"
          :x="Math.floor(i % 16) * (1 / 16) * 100 + '%'" :width="(1 / 16) * 100 + '%'"
          :y="Math.floor(i / 16) * (1 / 12) * 100 + '%'" :height="(1 / 12) * 100 + '%'"
          stroke-width="0.3"
          class="note note-empty"
          @mousedown="placenote(Math.floor(i % 16), Math.floor(i / 16))" />
    <rect v-for="note in notes" :key="`note${note.pitch}-${note.startTick}`"
          :x="(note.startTick / totalTicks_) * 100 + '%'" :width="(1 / 16) * 100 + '%'"
          :y="note.pitch * (1 / 12) * 100 + '%'" :height="(1 / 12) * 100 + '%'"
          stroke-width="0.3"
          class="note note-placed" />
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
      notes: [],
      position: 0,
      playing: true,
      totalTicks_: 16 * 16,
      computedWidth: 0,
      computedHeight: 0,
    }),
    mounted() {
      this.update();
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
        this.notes.forEach(note => {
          if(this.position == note.startTick) {
            this.$emit('noteon', { pitch: note.pitch });
            console.log('noteon: ', note.pitch);
          }
        });
        window.requestAnimationFrame(this.update);
      },
      placenote(x, y) {
        console.log(x, y);
        this.notes.push({
          pitch: y,
          startTick: x * 16,
          endTick: x + 16,
        });
        //this.$set(this.notes, noteIndex, 1 - this.notes[noteIndex]);
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
  
  min-width: 400px;
  min-height: 200px;
  max-width: 800px;
  max-height: 800px;
}
body {
  height: 100%;
}
.note {
  stroke: #3c3434;
}
.note-placed {
  fill: #29365a;
}
.note-empty {
  fill: transparent;
}
.bg1 {
  fill: #6d6966;
}
.bg2 {
  fill: #635e5a;
}
</style>
