<template>
  <!-- Grid -->
  <svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="none">
    <!-- Background -->
    <rect v-for="i in 4" :key="'bgrect' + i"
          :x="(i-1) * (100/4)" width="25" 
          y="0" height="100%"
          :class="(i-1) % 2 == 0 ? 'bg1' : 'bg2'" />
    <template v-for="j in 2">
      <!-- White/Black horizontal lines -->
      <rect v-for="i in 12" :key="'whiteBlackRect' + i+j"
            :x="0" width="100%"
            :y="(i-1) * 100 / 12 + (j-1) * 100" :height="100/12"
            class="blackKeyGrid"
            v-if="[2, 4, 6, 9, 11].includes(i%12)" />
      <!-- Empty rects -->
      <rect v-for="(note, i) in 12*16" :key="'emptyrect' + i+j"
            :x="Math.floor(i % 16) * (100 / 16)" :width="(100 / 16)"
            :y="Math.floor(i / 16) * (100 / 12) + (j-1) * 100" :height="(100 / 12)"
            stroke-width="0.1"
            class="note note-empty"
            @mousedown="placeNote(Math.floor(i % 16), Math.floor(i / 16) + (j-1) * 12)" />
    </template>
    <!-- Placed notes -->
    <rect v-for="note in notes" :key="`note${note.x}-${note.y}`"
          :x="note.x * 100 / 16" :width="100 / 16"
          :y="(11 - (note.pitch - 60)) * (1 / 24) * 100 + '%'" :height="(1 / 24) * 100 + '%'"
          stroke-width="0.1"
          class="note note-placed"
          @mousedown="removeNote(note)" />
    <!-- Outlines to make sections more visible -->
    <template v-for="j in 2">
      <path v-for="i in 4" :key="'outline1' + i + j"
            :d="`M25 0 L0 0 0 100`"
            :transform="`translate(${(i-1)*25}, ${(j-1)*100})`"
            class="line-outline"
            vector-effect="non-scaling-stroke" />
      <path d="M100 0 L100 100 0 100"
            :transform="`translate(0, ${(j-1)*100})`"
            :key="'outline2' + j"
            class="line-outline"
            vector-effect="non-scaling-stroke" />
      <path :d="`M0 ${100 / 12 * 7} L100 ${100 / 12 * 7}`"
            :transform="`translate(0, ${(j-1)*100})`"
            :key="'outline3' + j"
            class="line-outline"
            vector-effect="non-scaling-stroke" />
    </template>
    <!-- Playhead -->
    <line v-if="playing"
          :x1="playheadPosition * 100" y1="0"
          :x2="playheadPosition * 100" y2="100%"
          stroke-width="0.2" stroke="yellow" />
  </svg>
</template>
<script>
const generateNoteId = (() => {
  let id = 0;
  return () => 'sq' + id++
})();

let lastUpdate = 0;
let sequenceStartTime = 0;

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
    audioContext: {
      type: AudioContext,
      required: true,
    },
    bpm: {
      type: Number,
      default: 120,
      required: true,
    },
  },
  data: () => ({
    notes: [],
    sequencePosition: 0, // In seconds
    sequenceCurrentLoop: 0,
    playing: false,
    lookahead: 0.1, // In seconds
  }),
  mounted() {
    // TODO: Make timing precise with service workers!
    // Example: https://github.com/buildist/onlinesequencer/blob/master/app/sequencer.worker.js
    // With 8ms interval between ticks @ 16 ticks per 16th note runs at 118 BPM
    Array(16).fill(0).forEach((e, i) => {
      this.placeNote(i, 10);
    });
    this.update_();
  },
  methods: {
    update_() {
      if(this.playing) {
        let dt = this.audioContext.currentTime - lastUpdate;
        lastUpdate = this.audioContext.currentTime;
        this.sequencePosition += dt;
        if(this.sequencePosition > this.sequenceLength) {
          // ??? Wrap around
          this.sequencePosition -= this.sequenceLength;
          // And we need to check notes I think?
          this.sequenceCurrentLoop++;
          sequenceStartTime = this.audioContext.currentTime - this.sequencePosition;
        }
        this.notes.forEach(note => {
          // Once we trigger a note it needs to be ignored until the next loop

          const noteStartOffset = note.x * this.secondsPerSixteenthNote;
          const startTime = sequenceStartTime + noteStartOffset;
          if(this.audioContext.currentTime + this.lookahead > startTime
             && note.onTriggerCount === this.sequenceCurrentLoop) {
            note.onTriggerCount++;
            console.log("Noteon! %o %o", note, startTime)
            this.$emit('noteOn', { note, whenTime: startTime });
          }

          const noteEndOffset = noteStartOffset + 1 * this.secondsPerSixteenthNote;
          const endTime = sequenceStartTime + noteEndOffset;
          if(this.audioContext.currentTime + this.lookahead > endTime
             && note.offTriggerCount === this.sequenceCurrentLoop) {
            note.offTriggerCount++;
            this.$emit('noteOff', { note, whenTime: endTime });
          }
        });
      }
      window.requestAnimationFrame(this.update_);
    },
    placeNote(x, y) {
      const posP = x / 16.0;
      const bonus = posP > this.playheadPosition ? 0 : 1;
      this.notes.push({
        id: generateNoteId(),
        pitch: 60 + (11 - y),
        x, y,
        onTriggerCount: this.sequenceCurrentLoop + bonus,
        offTriggerCount: this.sequenceCurrentLoop + bonus,
      });
    },
    removeNote(note) {
      const index = this.notes.indexOf(note);
      this.notes.splice(index, 1);
    },
    play() {
      this.stop();
      this.playing = true;
      sequenceStartTime = this.audioContext.currentTime;
      lastUpdate = this.audioContext.currentTime;
    },
    stop() {
      this.sequencePosition = 0;
      this.sequenceCurrentLoop = 0;
      this.playing = false;
      this.notes.forEach(note => {
        note.onTriggerCount = 0;
        note.offTriggerCount = 0;
      });
    },
    resume() {
      this.playing = true;
    },
  },
  computed: {
    playheadPosition: self => self.sequencePosition / self.sequenceLength,
    secondsPerSixteenthNote: self => 60 / self.bpm / 4,
    sequenceLength: self => self.secondsPerSixteenthNote * 16,
  },
}
</script>
<style lang="scss" scoped>
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
  fill: #575757b8;
}
.line-outline {
  stroke: #181717;
  fill: none;
  stroke-width: 1px;
}
</style>
