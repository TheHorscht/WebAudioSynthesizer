<template>
  <div ref="container" :style="{ width: width + 'px', height: height + 'px' }">
  <!-- Keyboard -->
  <svg width="100%" height="100%">
    <!-- White keys -->
    <rect x="0" y="0" width="100%" height="100%" fill="white" />
    <!-- Black keys -->
    <template v-for="i in 12">
      <rect x="0" :y="(i-1) * computedHeight / 12"
            width="65%" height="8.33%"
            fill="black" :key="'blackkey'+i" v-if="[2, 4, 6, 9, 11].includes(i)"/>
    </template>
  </svg>
  <!-- Grid -->
  <svg width="100%" height="100%" shape-rendering="crispEdges">
    <!-- Background -->
    <rect v-for="i in 4" :key="'bgrect' + i"
          :x="(i-1) * (1/4) * 100 + '%'" width="25%" 
          y="0" height="100%"
          :class="(i-1) % 2 == 0 ? 'bg1' : 'bg2'" />
    <!-- White/Black horizontal lines -->
    <rect v-for="i in 12" :key="'whiteBlackRect' + i"
          :x="0" width="100%"
          :y="(i-1) * computedHeight / 12" height="8.33%"
          class="blackKeyGrid"
          v-if="[2, 4, 6, 9, 11].includes(i)" />
    <!-- Empty rects -->
    <rect v-for="(note, i) in 12*16" :key="'emptyrect' + i"
          :x="Math.floor(i % 16) * (1 / 16) * 100 + '%'" :width="(1 / 16) * 100 + '%'"
          :y="Math.floor(i / 16) * (1 / 12) * 100 + '%'" :height="(1 / 12) * 100 + '%'"
          stroke-width="0.3"
          class="note note-empty"
          @mousedown="placeNote(Math.floor(i % 16), Math.floor(i / 16))" />
    <!-- Placed notes -->
    <rect v-for="note in notes" :key="`note${note.pitch}-${note.startTick}`"
          :x="(note.startTick / totalTicks_) * 100 + '%'" :width="(1 / 16) * 100 + '%'"
          :y="(11 - (note.pitch - 60)) * (1 / 12) * 100 + '%'" :height="(1 / 12) * 100 + '%'"
          stroke-width="0.3"
          class="note note-placed"
          @mousedown="removeNote(note)" />
    <!-- Outlines to make sections more visible -->
    <svg width="100%" height="100%" viewBox="0 0 100 100"
         preserveAspectRatio="none"
         shape-rendering="crispEdges">
      <path v-for="i in 4" :key="'outline' + i"
            d="M25 0 L0 0 0 25" :transform="`translate(${(i-1)*25},${0})`"
            stroke="red" fill="none"
            vector-effect="non-scaling-stroke" />
    </svg>
    <!-- Playhead -->
    <line v-if="playing"
          :x1="tickP * computedWidth" y1="0"
          :x2="tickP * computedWidth" y2="100%"
          stroke-width="1" stroke="yellow" />
  </svg>
  </div>
</template>
<script>
const generateNoteId = (() => {
  let id = 0;
  return () => id++
})();

export default {
  name: 'VueSequencer',
  props: {
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 400,
    },
  },
  data: () => ({
    notes: [],
    position: 0,
    playing: false,
    totalTicks_: 16 * 16,
    computedWidth: 0,
    computedHeight: 0,
  }),
  mounted() {
    const child = this.$refs.container;
    const observer = new MutationObserver(mutations => {
      calculateAndSetSize();
    });

    const calculateAndSetSize = () => {
      let newWidth = parseInt(window.getComputedStyle(child).width, 10);
      newWidth -= 100;
      let newHeight = parseInt(window.getComputedStyle(child).height, 10);
      this.computedWidth = newWidth;
      this.computedHeight = newHeight;
      console.log(newWidth)
    };
    calculateAndSetSize();

    observer.observe(child, { attributes: true, attributeFilter: ['style'] });
    this.update();
  },
  methods: {
    update() {
      if(this.playing) {
        this.notes.forEach(note => {
          if(this.position == note.startTick) {
            this.$emit('noteon', note);
          }
          if(this.position == note.endTick) {
            this.$emit('noteoff', note);
          }
        });
        this.position += 1;
        this.position %= this.totalTicks_;
      }
      window.requestAnimationFrame(this.update);
    },
    placeNote(x, y) {
      const startTick = x * 16;
      const endTick = startTick + 8;
      const index = this.notes.findIndex(note => note.startTick === startTick);
/*       if(index >= 0) {
        this.notes.splice(index, 1);
      } else { */
        this.notes.push({
          id: generateNoteId(),
          pitch: 60 + (11 - y),
          startTick, endTick,
        });
      // }
    },
    removeNote(note) {
      const index = this.notes.indexOf(note);
      this.notes.splice(index, 1);
    },
    stop() {
      this.position = 0;
      this.playing = false;
    },
    resume() {
      this.playing = true;
    },
  },
  computed: {
    tickP: self => self.position / self.totalTicks_,
  },
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
  fill: #63615f;
}
.blackKeyGrid {
  fill: #5757574d;
}
</style>
