<template>
  <div ref="container" :style="{ width: width + 'px', height: height + 'px' }">
  <!-- Keyboard -->
  <svg width="100%" height="100%">
    <!-- White keys -->
    <rect x="0" y="0" width="100%" height="100%" fill="white" />
    <!-- Black keys -->
    <template v-for="i in 12">
      <rect x="0" :y="(i-1) * computedHeight_ / 12"
            width="65%" height="8.33%"
            fill="black" :key="'blackkey'+i" v-if="[2, 4, 6, 9, 11].includes(i)"/>
    </template>
  </svg>
  <!-- Grid -->
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- Background -->
    <rect v-for="i in 4" :key="'bgrect' + i"
          :x="(i-1) * (100/4)" width="25" 
          y="0" height="100%"
          :class="(i-1) % 2 == 0 ? 'bg1' : 'bg2'" />
    <!-- White/Black horizontal lines -->
    <rect v-for="i in 12" :key="'whiteBlackRect' + i"
          :x="0" width="100%"
          :y="(i-1) * 100 / 12" height="8.33%"
          class="blackKeyGrid"
          v-if="[2, 4, 6, 9, 11].includes(i)" />
    <!-- Empty rects -->
    <rect v-for="(note, i) in 12*16" :key="'emptyrect' + i"
          :x="Math.floor(i % 16) * (100 / 16)" :width="(100 / 16)"
          :y="Math.floor(i / 16) * (100 / 12)" :height="(100 / 12)"
          stroke-width="0.1"
          class="note note-empty"
          @mousedown="placeNote(Math.floor(i % 16), Math.floor(i / 16))" />
    <!-- Placed notes -->
    <rect v-for="note in notes" :key="`note${note.pitch}-${note.startTick}`"
          :x="(note.startTick / totalTicks_) * 100 + '%'" :width="(1 / 16) * 100 + '%'"
          :y="(11 - (note.pitch - 60)) * (1 / 12) * 100 + '%'" :height="(1 / 12) * 100 + '%'"
          stroke-width="0.1"
          class="note note-placed"
          @mousedown="removeNote(note)" />
    <!-- Outlines to make sections more visible -->
      <path v-for="i in 4" :key="'outline' + i"
            d="M25 0 L0 0 0 100" :transform="`translate(${(i-1)*25},${0})`"
            class="line-outline"
            vector-effect="non-scaling-stroke" />
      <path d="M100 0 L100 100 0 100"
            class="line-outline"
            vector-effect="non-scaling-stroke" />
      <path :d="`M0 ${100 / 12 * 7} L100 ${100 / 12 * 7}`"
            class="line-outline"
            vector-effect="non-scaling-stroke" />
    <!-- Playhead -->
    <line v-if="playing"
          :x1="tickP * 100" y1="0"
          :x2="tickP * 100" y2="100%"
          stroke-width="0.2" stroke="yellow" />
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
    playmarkerPosition_: 0,
    playing: false,
    totalTicks_: 16 * 16,
    computedWidth_: 0,
    computedHeight_: 0,
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
      this.computedWidth_ = newWidth;
      this.computedHeight_ = newHeight;
    };
    calculateAndSetSize();

    observer.observe(child, { attributes: true, attributeFilter: ['style'] });
    // TODO: Make timing precise with service workers!
    // Example: https://github.com/buildist/onlinesequencer/blob/master/app/sequencer.worker.js
    // With 8ms interval between ticks @ 16 ticks per 16th note runs at 118 BPM
    window.setInterval(this.update_, 8);
    this.updateVisuals_();
  },
  methods: {
    update_() {
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
    },
    updateVisuals_() {
      this.playmarkerPosition_ = this.position;
      window.requestAnimationFrame(this.updateVisuals_);
    },
    placeNote(x, y) {
      const startTick = x * 16;
      const endTick = startTick + 16;
      const index = this.notes.findIndex(note => note.startTick === startTick);
        this.notes.push({
          id: generateNoteId(),
          pitch: 60 + (11 - y),
          startTick, endTick,
        });
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
    tickP: self => self.playmarkerPosition_ / self.totalTicks_,
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
svg {
  shape-rendering: crispEdges;
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
.line-outline {
  stroke: #484140;
  fill: none;
  stroke-width: 2px;
}
</style>
