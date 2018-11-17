<template>
  <!-- Grid -->
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- Background -->
    <rect v-for="i in barsVisibleInViewport + 1" :key="'bgrect' + i"
          :x="(i-1) * beatWidthInViewport - viewportStart * beatWidthInViewport"
          y="0" :width="beatWidthInViewport" height="100%"
          :class="(i-1) % 2 == 0 ? 'bg1' : 'bg2'" />
      <!-- White/Black horizontal lines for black keys -->
    <rect v-for="i in Math.ceil(octavesVisibleInViewport) * 12" :key="'whiteBlackRect' + i"
          :x="0" width="100"
          :y="(i-1) * noteHeight" :height="noteHeight"
          class="blackKeyGrid"
          v-if="[2, 4, 6, 9, 11].includes(i%12)" />
    <!-- Empty rects -->
    <line v-for="x in barsVisibleInViewport * 4" :key="`noteLineX${x}`"
          :x1="(x-1)*noteWidth" :x2="(x-1)*noteWidth"
          y1="0" y2="100"
          class="note-line"
          vector-effect="non-scaling-stroke" />
    <line v-for="y in Math.floor(octavesVisibleInViewport * 12 + 1)" :key="`noteLineY${y}`"
          x1="0" x2="100"
          :y1="(y-1)*noteHeight" :y2="(y-1)*noteHeight"
          class="note-line"
          vector-effect="non-scaling-stroke" />
    <!-- Placed notes -->
    <rect v-for="note in notes" :key="`note${note.x}-${note.y}`"
          :x="note.x * 100 / 16" :width="100 / 16"
          :y="note.y * (1 / 12) * 100" :height="(1 / 24) * 100 + '%'"
          stroke-width="0.1"
          class="note note-placed"
          @mousedown="removeNote(note)" />
    <!-- Outlines to make sections more visible -->
    <path v-for="i in barsVisibleInViewport + 1" :key="'outline1' + i"
          :d="`M0 0 L0 100`"
          :transform="`translate(${(i-1)*beatWidthInViewport}, 0)`"
          class="line-outline"
          vector-effect="non-scaling-stroke" />
    <template v-for="i in Math.floor(octavesVisibleInViewport+0.5)">
      <!-- E -> F separator -->
      <line :key="'eToFSeparator' + i"
            x1="0" x2="100"
            :y1="noteHeight*i*7 + (i-1) * noteHeight * 5"
            :y2="noteHeight*i*7 + (i-1) * noteHeight * 5"
            class="line-outline"
            vector-effect="non-scaling-stroke" />
      <!-- Octave separator -->
      <line :key="'octaveSeparator' + i"
            x1="0" x2="100"
            :y1="noteHeight*12*i"
            :y2="noteHeight*12*i"
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
        pitch: 59 - y, // y geht von 0 bis 23
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
    // viewportStart: self => Math.cos(self.dbg_pos) * 0.5 + 0.5,
    viewportStart: self => self.cycle,
    // viewportEnd: self => self.viewportStart + (Math.cos(self.dbg_pos) * 0.5 + 0.5) * 1.5 + 0.5,
    viewportEnd: self => 1.5,
    beatWidthInViewport: self => 100 / (4 * (self.viewportEnd - self.viewportStart)),
    barsVisibleInViewport: self => Math.ceil((self.viewportEnd - self.viewportStart) * 4),
    octaveStart: self => 0,
    octaveEnd: self => 1.5,
    octavesVisibleInViewport: self => self.octaveEnd - self.octaveStart,
    notesVisibleInViewport: self => self.barsVisibleInViewport * 16,
    noteWidth: self => self.beatWidthInViewport / 4,
    noteHeight: self => 100 / (self.octavesVisibleInViewport * 12),
    cycle: self => Math.cos(self.dbg_pos) * 0.5 + 0.5,
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
