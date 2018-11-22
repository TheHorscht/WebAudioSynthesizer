<template>
  <!-- Grid -->
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
       @pointerdown="onPointerDown">
    <!-- Background -->
    <rect v-for="i in Math.ceil(numBarsVisibleInViewport * 4 + 1)" :key="'bgrect' + i"
          :x="(i-1) * noteWidth * 4 - (viewportStart % (1/4)) * noteWidth * 16"
          :width="noteWidth * 4"
          y="0" height="100%"
          :class="(i-1) % 2 === Math.floor((viewportStart % 0.5) * 4) ? 'bg1' : 'bg2'" />
    <!-- White/Black horizontal lines for black keys -->
    <rect v-for="i in Math.ceil(numOctavesVisibleInViewport * 12) + 1" :key="'whiteBlackRect' + i"
          :x="0" width="100"
          :y="100 - (i-0) * noteHeight + (octaveStart % (1/ 12)) * noteHeight * 12"
          :height="noteHeight"
          class="blackKeyGrid"
          v-if="[2, 4, 6, 9, 11].includes(Math.ceil((13-i) + 24 - octaveStart * 12)%12)" />
    <!-- Empty rects -->
    <line v-for="x in Math.ceil(numBarsVisibleInViewport * 16 + 1)" :key="`noteLineX${x}`"
          :x1="(x-1)*noteWidth - (viewportStart % (1 / 16)) * noteWidth * 16"
          :x2="(x-1)*noteWidth - (viewportStart % (1 / 16)) * noteWidth * 16"
          y1="0" y2="100"
          class="note-line"
          vector-effect="non-scaling-stroke" />
    <line v-for="y in Math.ceil(numOctavesVisibleInViewport * 12 + 1)" :key="`noteLineY${y}`"
          x1="0" x2="100"
          :y1="100 - (y-1)*noteHeight + (octaveStart % (1/ 12)) * noteHeight * 12"
          :y2="100 - (y-1)*noteHeight + (octaveStart % (1/ 12)) * noteHeight * 12"
          class="note-line"
          vector-effect="non-scaling-stroke" />
    <!-- Lines for beats -->
    <path v-for="i in Math.ceil(numBarsVisibleInViewport * 4 + 1)" :key="'outline1' + i"
          :d="`M0 0 L0 100`"
          :transform="`translate(${(i-1)*noteWidth * 4 - (viewportStart % (1 / 4)) * noteWidth * 16}, 0)`"
          class="beat-line"
          vector-effect="non-scaling-stroke" />
    <!-- Lines for bars -->
    <line v-for="x in Math.ceil(numBarsVisibleInViewport + 1)" :key="`barLineX${x}`"
          :x1="(x-1)*noteWidth*16 - (viewportStart % (1 / 1)) * noteWidth * 16"
          :x2="(x-1)*noteWidth*16 - (viewportStart % (1 / 1)) * noteWidth * 16"
          y1="0" y2="100"
          class="bar-line"
          vector-effect="non-scaling-stroke" />
    <template v-for="i in Math.ceil(numOctavesVisibleInViewport) + 1">
      <!-- E -> F separator -->
      <line :key="'eToFSeparator' + i"
            x1="0" x2="100"
            :y1="100 - noteHeight*5*i - (i-1) * noteHeight * 7 + (octaveStart % 1) * noteHeight * 12"
            :y2="100 - noteHeight*5*i - (i-1) * noteHeight * 7 + (octaveStart % 1) * noteHeight * 12"
            class="e-to-f-line"
            vector-effect="non-scaling-stroke" />
      <!-- Octave separator -->
      <line :key="'octaveSeparator' + i"
            x1="0" x2="100"
            :y1="100 - noteHeight*12*i + (octaveStart % 1) * noteHeight * 12"
            :y2="100 - noteHeight*12*i + (octaveStart % 1) * noteHeight * 12"
            class="octave-line"
            vector-effect="non-scaling-stroke" />
    </template>
    <!-- Placed notes -->
    <rect v-for="note in notes" :key="`note${note.x}-${note.y}`"
          :width="noteWidth" :height="noteHeight"
          :x="note.x * noteWidth - viewportStart * noteWidth * 16"
          :y="100 - (note.y+1) * noteHeight + octaveStart * noteHeight * 12"
          stroke-width="0.1"
          class="note note-placed"
          @mousedown="removeNote(note)" />
    <!-- Playhead -->
    <line v-if="playing"
          :x1="playheadPosition * 100" y1="0"
          :x2="playheadPosition * 100" y2="100%"
          stroke-width="0.2" stroke="yellow" />
  </svg>
</template>
<script>
import '../browser-check.js'

const generateNoteId = (() => {
  let id = 0;
  return () => 'sq' + id++
})();

let lastUpdate = 0;
let sequenceStartTime = 0;

export default {
  name: 'VueSequencer',
  props: {
/*     width: {
      type: Number,
      default: 800,
    }, */
/*     height: {
      type: Number,
      default: 400,
    }, */
    audioContext: {
      type: AudioContext,
      required: true,
    },
    bpm: {
      type: Number,
      default: 120,
      required: true,
    },



    viewportStart: {
      type: Number,
      default: 0,
    },
    viewportEnd: {
      type: Number,
      default: 2,
    },
    octaveStart: {
      type: Number,
      default: 0,
    },
    octaveEnd: {
      type: Number,
      default: 2,
    },
  },
  data: () => ({
    notes: [],
    sequencePosition: 0, // In seconds
    sequenceCurrentLoop: 0,
    playing: false,
    lookahead: 0.1, // In seconds
    numBars: 4,
/*     viewportStart: 0,
    viewportEnd: 1, */
    dbg_pos: 0,
  }),
  mounted() {
    this.update_();
  },
  methods: {
    update_() {
      this.dbg_pos += 0.01;
      if(this.playing) {
        const upcomingEvents = this.getUpcomingEvents(this.sequencePosition, this.lookahead);
        upcomingEvents.on.forEach(note => {
          const noteStartOffset = note.x * this.secondsPerSixteenthNote;
          let noteOnTime = noteStartOffset + this.sequenceLength * note.onTriggerCount;
          noteOnTime += sequenceStartTime;
          note.onTriggerCount++;
          this.$emit('noteOn', { note, whenTime: noteOnTime });
        });
        upcomingEvents.off.forEach(note => {
          const noteEndOffset = note.x * this.secondsPerSixteenthNote + this.secondsPerSixteenthNote;
          let noteOffTime = noteEndOffset + this.sequenceLength * note.offTriggerCount;
          noteOffTime += sequenceStartTime;
          note.offTriggerCount++;
          this.$emit('noteOff', { note, whenTime: noteOffTime });
        });

        let dt = this.audioContext.currentTime - lastUpdate;
        lastUpdate = this.audioContext.currentTime;
        this.sequencePosition += dt;
        if(this.sequencePosition > this.sequenceLength) {
          this.sequencePosition -= this.sequenceLength;
          this.sequenceCurrentLoop++;
        }
      }
      window.requestAnimationFrame(this.update_);
    },
    placeNote(x, y) {
      const posP = x / 16.0;
      const bonus = posP > this.playheadPosition ? 0 : 1;
      this.notes.push({
        id: generateNoteId(),
        pitch: y,
        x, y,
        onTriggerCount: this.sequenceCurrentLoop + bonus,
        offTriggerCount: this.sequenceCurrentLoop + bonus,
      });
    },
    removeNote(note) {
      const index = this.notes.indexOf(note);
      this.notes.splice(index, 1);
    },
    getUpcomingEvents(timeInSequence, lookahead) {
      const upcomingEvents = {
        on: [], off: []
      };
      const getEventsInInterval = (startTime, endTime, loopCompensation = 0) => {
        return {
          on: this.notes.filter(note => {
            const noteStartOffset = note.x * this.secondsPerSixteenthNote;
            return noteStartOffset >= startTime
                && noteStartOffset <= endTime
                && note.onTriggerCount === this.sequenceCurrentLoop + loopCompensation;
          }),
          off: this.notes.filter(note => {
            const noteEndOffset = note.x * this.secondsPerSixteenthNote + this.secondsPerSixteenthNote;
            return noteEndOffset >= startTime
                && noteEndOffset <= endTime
                && note.offTriggerCount === this.sequenceCurrentLoop + loopCompensation;
          }),
        }
      }

      const overshoot = timeInSequence + lookahead - this.sequenceLength;
      if(overshoot > 0) {
        const eventsAtEnd = getEventsInInterval(timeInSequence, this.sequenceLength);
        const eventsAtStart = getEventsInInterval(0, overshoot, 1);
        upcomingEvents.on.push(...eventsAtEnd.on);
        upcomingEvents.on.push(...eventsAtStart.on);
        upcomingEvents.off.push(...eventsAtEnd.off);
        upcomingEvents.off.push(...eventsAtStart.off);
      } else {
        const events = getEventsInInterval(timeInSequence, timeInSequence + lookahead);
        upcomingEvents.on.push(...events.on);
        upcomingEvents.off.push(...events.off);
      }
      return upcomingEvents;
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
      this.$emit('stop');
    },
    resume() {
      this.playing = true;
    },
    onPointerDown(e) {
      // placeNote
      const pixelsPerBar = this.width / this.numBarsVisibleInViewport;
      const pixelsPerOctave = this.height / this.numOctavesVisibleInViewport;
      const pixelsPer16th = pixelsPerBar / 16;
      const pixelsPerNote = this.height * (this.noteHeight / 100);
      const x = Math.floor((e.offsetX + this.viewportStart * pixelsPerBar) / pixelsPer16th);
      const y = Math.floor((this.octaveStart * pixelsPerOctave + (this.height - e.offsetY)) / pixelsPerNote);
      this.placeNote(x, y);
      // console.log(x, y);
    }
  },
  watch: {
    bpm(newBPM, oldBPM) {
      if(newBPM > oldBPM) {
        this.sequencePosition = (oldBPM / newBPM) * this.sequencePosition;
      } else {
        this.stop();
        this.play();
      }
    }
  },
  computed: {
    playheadPosition: self => self.sequencePosition / self.sequenceLength,
    secondsPerSixteenthNote: self => 60 / self.bpm / 4,
    sequenceLength: self => self.secondsPerSixteenthNote * 16,

    numOctavesVisibleInViewport: self => self.octaveEnd - self.octaveStart,
    numBarsVisibleInViewport: self => self.viewportEnd - self.viewportStart,

    noteWidth: self => 100 / (self.numBarsVisibleInViewport * 16),
    noteHeight: self => 100 / (self.numOctavesVisibleInViewport * 12),

    cycle: self => Math.cos(self.dbg_pos) * 0.5 + 0.5, // 0 - 1
    width: self => parseInt(window.getComputedStyle(self.$el).width, 10),
    height: self => parseInt(window.getComputedStyle(self.$el).height, 10),
  },
}
</script>
<style lang="scss" scoped>
@import '../browser-check.scss';

svg {
  shape-rendering: crispEdges;
  @include browser(Firefox) {
    shape-rendering: auto;
  }
  position: relative;
  bottom: 0;
}
.note {
  stroke: #3c3434;
}
.note-placed {
  fill: #29365a;
}

.note-line {
  stroke: #3c3434;
  stroke-width: 1;
}
.bar-line {
  stroke: #1d1b1b;
  stroke-width: 2;
}
.octave-line {
  stroke: #181717;
  stroke-width: 0;
}
.e-to-f-line {
  stroke: #1d1b1b;
  stroke-width: 0;
}
.beat-line {
  stroke: #3a3333;
  stroke-width: 1;
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

.octave-text {
  // font-size: 3px;
  fill: yellow;
}
</style>
