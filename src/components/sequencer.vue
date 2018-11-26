<template>
  <!-- Grid -->
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
       @pointerdown.prevent="onPointerDown"
       @pointerup.prevent="onPointerUp"
       @pointermove.prevent="onPointerMove"
       @contextmenu.prevent>
    <!-- Background -->
    <rect v-for="i in Math.ceil(numBarsVisibleInViewport * 4 + 1)" :key="'bgrect' + i"
          :x="(i-1) * noteWidth * 4 - (viewportStart % (1/4)) * noteWidth * 16"
          :width="noteWidth * 4"
          y="0" height="100%"
          :class="(i-1) % 2 === Math.floor((viewportStart % 0.5) * 4) ? 'bg1' : 'bg2'" />
    <!-- White/Black horizontal lines for black keys -->
    <!-- TODO: This could be done better, was done lazily -->
    <rect v-for="i in Math.ceil(numOctavesVisibleInViewport * 12) + 13" :key="'whiteBlackRect' + i"
          :x="0" width="100"
          :y="100 - (i-1) * noteHeight + (octaveStart % 1) * noteHeight * 12"
          :height="noteHeight"
          class="blackKeyGrid"
          v-if="[2, 4, 7, 9, 11].includes((i-1)%12)" />
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
    <g v-for="(note, i) in notes" :key="`note-${i}`">
      <rect :width="barWidth * note.duration" :height="noteHeight"
            :x="note.x * noteWidth - viewportStart * noteWidth * 16"
            :y="100 - (note.y+1) * noteHeight + octaveStart * noteHeight * 12"
            stroke-width="0.1"
            :class="['note', 'note-placed', note.selected ? 'note-selected' : '']"
            @pointerdown.stop="onPointerDown($event, note)"
            @pointerup.stop="onPointerUp($event, note)"
            @pointermove.stop="onPointerMove($event, note)"
            @pointerdown.stop.right="removeNote(note)" />
      <!-- Resize handle -->
      <rect :width="2" :height="noteHeight"
            :x="note.x * noteWidth - viewportStart * noteWidth * 16 + barWidth * note.duration - 1"
            :y="100 - (note.y+1) * noteHeight + octaveStart * noteHeight * 12"
            class="note-resize-handle"
            @pointerdown.left.stop="onResizeNoteStart($event, note)"
            @pointerup.left.stop="onResizeNoteEnd($event, note)"
            @pointermove.stop="onResizeNote($event, note)" />
    </g>
    <!-- Selection rectangle -->
    <rect v-if="selecting"
          :x="((selection.left - viewportStart * 16) / 16 * 100) / numBarsVisibleInViewport"
          :y="100 - ((selection.bottom - octaveStart * 12) / 12 * 100) / numOctavesVisibleInViewport"
          :width="selection.width / 16 * 100 / numBarsVisibleInViewport"
          :height="selection.height / 12 * 100 / numOctavesVisibleInViewport"
          vector-effect="non-scaling-stroke"
          class="selection-rectangle" />
    <!-- Playhead -->
    <line v-if="playing"
          :x1="playheadPosition * 100" y1="0"
          :x2="playheadPosition * 100" y2="100%"
          stroke-width="0.2" stroke="yellow" />
  </svg>
</template>
<script>
import '../key-events.js'
import '../browser-check.js'

class SelectionRect {
  constructor(x, y) {
    this.start = { x, y };
    this.end = { x, y };
  }
  get left() {
    return Math.min(this.start.x, this.end.x);
  }
  get top() {
    return Math.min(this.start.y, this.end.y);
  }
  get right() {
    return Math.max(this.start.x, this.end.x);
  }
  get bottom() {
    return Math.max(this.start.y, this.end.y);
  }
  get width() {
    return this.right - this.left;
  }
  get height() {
    return this.bottom - this.top;
  }
}
window.sr = SelectionRect

const BUTTONS = {
  LEFT_MOUSE: 0,
  RIGHT_MOUSE: 2,
}

const generateNoteId = (() => {
  let id = 0;
  return () => 'sq' + id++
})();

let lastUpdate = 0;
let sequenceStartTime = 0;

export default {
  name: 'VueSequencer',
  props: {
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
    notesInHand: [],
    // selection: { top: 0, left: 0, bottom: 0, right: 0 },
    selection: new SelectionRect(0, 0),
    selecting: false,
    width: 1,
    height: 1,
    previewNote: null,
  }),
  mounted() {
    this.$nextTick(() => {
      this.width = parseInt(window.getComputedStyle(this.$el).width, 10);
      this.height = parseInt(window.getComputedStyle(this.$el).height, 10);
    });
    window.addEventListener('key-event-down-norepeat', e => {
      this.onKeyDown(e.detail);
    });
    this.update_();
  },
  methods: {
    update_() {
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
          const noteEndOffset = note.x * this.secondsPerSixteenthNote + this.secondsPerSixteenthNote * 16 * note.duration;
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
      const newNote = {
        id: generateNoteId(),
        pitch: y,
        x, y, fineX: x, fineY: y,
        duration: 1 / 16, // In bars
        selected: false,
        onTriggerCount: this.sequenceCurrentLoop + bonus,
        offTriggerCount: this.sequenceCurrentLoop + bonus,
      };
      this.notes.push(newNote);
      return newNote;
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
    onPointerDown(e, note) {
      this.$el.setPointerCapture(e.pointerId);
      if(e.button === BUTTONS.LEFT_MOUSE) {
        if(e.ctrlKey) {
          const { xFine, yFine } = this.coordsToNote(e.offsetX, e.offsetY);
          this.selection = new SelectionRect(xFine, yFine);
          this.selecting = true;
        } else if(e.shiftKey) {
          // Pointer down + shift = duplicate selected notes,
          // deselect current notes, select new notes and
          // place them in hand for moving around
          const selectedNotes = this.notes.filter(note => note.selected);
          this.notesInHand = [];
          selectedNotes.forEach(selectedNote => {
            const newNote = {
              ...selectedNote,
              id: generateNoteId(),
            };
            this.notes.push(newNote);
            this.notesInHand.push(newNote);
            selectedNote.selected = false;
          });
        } else if(!note) {
          const { x, y } = this.coordsToNote(e.offsetX, e.offsetY);
          const newNote = this.placeNote(x, y);
          this.notesInHand.push(newNote);
          if(this.notesInHand.length === 1) {
            this.emitPreviewOn(newNote.pitch);
          }
          this.deselectAllNotes();
        } else {
          this.notesInHand = [note];
          this.notesInHand.push(...this.notes.filter(
            n => n.selected === true && note !== n
          ));
          if(this.notesInHand.length === 1) {
            this.emitPreviewOn(note.pitch);
          }
        }
      } else if(e.button === BUTTONS.RIGHT_MOUSE) {
        this.notes.forEach(note => note.selected = false);
      }
    },
    onPointerUp(e, note) {
      this.$el.releasePointerCapture(e.pointerId);
      if(e.button === BUTTONS.LEFT_MOUSE) {
        const { x, y } = this.coordsToNote(e.offsetX, e.offsetY);
        this.notes.forEach(note => {
          if(this.selecting && 
             !(note.fineX < this.selection.left
            || note.fineX > this.selection.right
            || note.fineY < this.selection.top
            || note.fineY > this.selection.bottom)) {
              note.selected = true;
          }
        });
        this.notesInHand.forEach(note => {
          note.fineX = note.x;
          note.fineY = note.y;
        });
        this.notesInHand = [];
        this.emitPreviewOff();
      }
      this.selecting = false;
    },
    onPointerMove(e, note) {
      if (this.$el.hasPointerCapture(e.pointerId)) {
        this.notesInHand.forEach(note => {
          note.fineX += e.movementX / (this.width / this.numBarsVisibleInViewport / 16);
          note.fineY -= e.movementY / (this.height / this.numOctavesVisibleInViewport / 12);
          note.x = Math.max(0, Math.round(note.fineX));
          const oldPitch = note.y;
          note.y = Math.round(note.fineY);
          note.pitch = note.y;
          if(this.notesInHand.length === 1 && note.pitch !== oldPitch) {
            this.emitPreviewOn(note.pitch);
          }
        });
        if(e.ctrlKey) {
          const { xFine, yFine } = this.coordsToNote(e.offsetX, e.offsetY);
          this.selection.end.x = xFine;
          this.selection.end.y = yFine;
        }
        if(e.buttons === BUTTONS.RIGHT_MOUSE) {
          const { x, y } = this.coordsToNote(e.offsetX, e.offsetY);
          const noteUnderCursor = this.notes.find(note => note.x === x && note.y === y);
          if(noteUnderCursor) {
            this.removeNote(noteUnderCursor);
          }
        }
      }
      //console.log((e.buttons & BUTTONS.RIGHT_MOUSE) > 0)
    },
    emitPreviewOn(pitch) {
      this.emitPreviewOff();
      this.previewNote = { id: 'preview', pitch };
      this.$emit('noteOn', { note: this.previewNote, whenTime: this.audioContext.currentTime });
    },
    emitPreviewOff() {
      if(this.previewNote) {
        this.$emit('noteOff', { note: this.previewNote, whenTime: this.audioContext.currentTime });
      }
    },
    onKeyDown(e) {
      (({
        'Delete': () => {
          this.notes = this.notes.filter(note => !note.selected);
        },
        'KeyA': () => {
          if(e.ctrlKey) {
            this.notes.forEach(note => note.selected = true);
          }
        },
      })[e.code] || (() => null))();
    },
    onResizeNoteStart(e, note) {
      e.target.setPointerCapture(e.pointerId);
    },
    onResizeNoteEnd(e, note) {
      e.target.releasePointerCapture(e.pointerId);
    },
    onResizeNote(e, note) {
      if (e.target.hasPointerCapture(e.pointerId)) {
        const moveX = e.movementX / (this.width / this.numBarsVisibleInViewport);
        const selectedNotes = this.notes.filter(note => note.selected);
        if(!selectedNotes.includes(note)) {
          selectedNotes.push(note);
        }
        selectedNotes.forEach(note => {
          note.duration = Math.max(1 / 64, note.duration + moveX);
        });
      }
    },
    deselectAllNotes() {
      this.notes.forEach(note => note.selected = false);
    },
    coordsToNote(x, y) {
      const pixelsPerBar = this.width / this.numBarsVisibleInViewport;
      const pixelsPerOctave = this.height / this.numOctavesVisibleInViewport;
      const pixelsPer16th = pixelsPerBar / 16;
      const pixelsPerNote = this.height * (this.noteHeight / 100);
      const xFineOut = (x + this.viewportStart * pixelsPerBar) / pixelsPer16th;
      const yFineOut = (this.octaveStart * pixelsPerOctave + (this.height - y)) / pixelsPerNote;
      const xOut = Math.floor(xFineOut);
      const yOut = Math.floor(yFineOut);
      return { x: xOut, y: yOut, xFine: xFineOut, yFine: yFineOut, };
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

    barWidth: self => 100 / self.numBarsVisibleInViewport,
    noteWidth: self => 100 / (self.numBarsVisibleInViewport * 16),
    noteHeight: self => 100 / (self.numOctavesVisibleInViewport * 12),
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
  stroke: #41495f;
}
.note-placed {
  fill: #29365a;
}
.note-selected {
  fill: #304fa5;
}
.note-resize-handle {
  cursor: ew-resize;
  fill: transparent;
  stroke: none;
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

.selection-rectangle {
  fill: none;
  stroke: yellow;
  stroke-width: 1;
}
</style>
