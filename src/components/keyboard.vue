<template>
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect v-for="i in 96" v-if="isWhiteKey(i) && isWhiteKeyVisible(i)" :key="'whiteKey'+i"
            :class="['white-key', isKeyDown_[i-1] ? 'white-key-down' : '']" vector-effect="non-scaling-stroke"
            x="0" width="100"
            :y="100 - whiteKeyYPositionsAbsolute[i-1] + octaveStart * (100 / numOctavesVisibleInViewport)"
            :height="whiteKeyHeights_[(i-1)%12] / numOctavesVisibleInViewport"
            :data-b="`i: ${i}, `"
            @pointerdown="keyDown(i-1, true, $event)"
            @pointerup="keyUp(i-1, true, $event)" />
      <rect v-for="i in 96" v-if="isBlackKey(i) && isBlackKeyVisible(i)" :key="'blackKey'+i"
            x="0" width="63"
            :y="100 - blackKeyYPositionsAbsolute[i-1] + octaveStart * (100 / numOctavesVisibleInViewport)"
            :height="blackKeyHeights_[(i-1)%12] / numOctavesVisibleInViewport"
            :class="['black-key', isKeyDown_[i-1] ? 'black-key-down' : '']"
            :data-b="`i: ${i}, `"
            @pointerdown="keyDown(i-1, true, $event)"
            @pointerup="keyUp(i-1, true, $event)" />
  </svg>
</template>
<script>
import '../key-events.js'
import '../browser-check.js'

let keysToMidiNote = {
  "KeyZ": 36,
  "KeyS": 37,
  "KeyX": 38,
  "KeyD": 39,
  "KeyC": 40,
  "KeyV": 41,
  "KeyG": 42,
  "KeyB": 43,
  "KeyH": 44,
  "KeyN": 45,
  "KeyJ": 46,
  "KeyM": 47,
  "Comma": 48,
  "KeyL": 49,
  "Period": 50,
  "Semicolon": 51,
  "Slash": 52,
  "KeyQ": 48,
  "Digit2": 49,
  "KeyW": 50,
  "Digit3": 51,
  "KeyE": 52,
  "KeyR": 53,
  "Digit5": 54,
  "KeyT": 55,
  "Digit6": 56,
  "KeyY": 57,
  "Digit7": 58,
  "KeyU": 59,
  "KeyI": 60,
  "Digit9": 61,
  "KeyO": 62,
  "Digit0": 63,
  "KeyP": 64,
  "BracketLeft": 65,
  "Equal": 66,
  "BracketRight": 67,
};

export default {
  name: 'VueKeyboard',
  props: {
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
    isKeyDown_: {},
    whiteKeyHeights_: [12.285, 0, 17.285, 0, 13.285, 12.285, 0, 16.285, 0, 16.285, 0, 12.285],
    blackKeyHeights_: Array(12).fill(100/12),
  }),
  computed: {
    numOctavesVisibleInViewport: self => (self.octaveEnd - self.octaveStart),
    numKeysVisibleInViewport: self => self.numOctavesVisibleInViewport * 12,
    keyOffset: self => (self.octaveStart % 1) * 12,
    whiteKeyYPositions: self => {
      let curPos = 0;
      return self.whiteKeyHeights_.map(v => {
        curPos += v;
        return curPos;
      });
    },
    whiteKeyYPositionsAbsolute: self => {
      let posis = [];
      for(let i = 0; i < 8; i++) {
        posis.push(...self.whiteKeyYPositions.map(v => v / self.numOctavesVisibleInViewport + i * (100 / self.numOctavesVisibleInViewport)));
      }
      return posis;
    },
    blackKeyYPositions: self => {
      let curPos = 0;
      return self.blackKeyHeights_.map(v => {
        curPos += v;
        return curPos;
      });
    },
    blackKeyYPositionsAbsolute: self => {
      let posis = [];
      for(let i = 0; i < 8; i++) {
        posis.push(...self.blackKeyYPositions.map(v => v / self.numOctavesVisibleInViewport + i * (100 / self.numOctavesVisibleInViewport)));
      }
      return posis;
    },
  },
  mounted() {
    window.shit = this;
    window.addEventListener('key-event-down-norepeat', e => {
      e = e.detail;
      if(e.code in keysToMidiNote) {
        const note = {
          id: 'kb' + keysToMidiNote[e.code],
          pitch: keysToMidiNote[e.code],
        };
        // this.$emit('noteOn', note);
        this.keyDown(keysToMidiNote[e.code], true);
      }
    });
    window.addEventListener('key-event-up', e => {
      e = e.detail;
      const note = {
        id: 'kb' + keysToMidiNote[e.code],
        pitch: keysToMidiNote[e.code],
      };
      // this.$emit('noteOff', note);
      this.keyUp(keysToMidiNote[e.code], true);
    });
  },
  methods: {
    keyDown(keyNumber, triggerEventEmit, e) {
      if(e) {
        e.target.setPointerCapture(e.pointerId);
      }
      const note = {
        id: 'kb' + keyNumber,
        pitch: keyNumber,
      };
      if(triggerEventEmit && !this.isKeyDown_[keyNumber]) {
        this.$emit('noteOn', note);
      }
      this.$set(this.isKeyDown_, keyNumber, true);
    },
    keyUp(keyNumber, triggerEventEmit, e) {
      if(e) {
        e.target.releasePointerCapture(e.pointerId);
      }
      if(this.isKeyDown_[keyNumber]) {
        const note = {
          id: 'kb' + keyNumber,
          pitch: keyNumber,
        };
        if(triggerEventEmit && this.isKeyDown_[keyNumber]) {
          this.$emit('noteOff', note);
        }
        this.$set(this.isKeyDown_, keyNumber, false);
      }
    },
    releaseAllKeys() {
      for(let keyNumber in this.isKeyDown_) {
        this.$set(this.isKeyDown_, keyNumber, false);
      }
    },
    isWhiteKeyVisible(i) {
      return i > this.octaveStart * 12 - 1 && i < this.octaveEnd * 12 + 2;
    },
    isWhiteKey(i) {
      return [1,3,5,6,8,10,12].includes((i-1)%12+1);
    },
    isBlackKeyVisible(i) {
      return i > this.octaveStart * 12 - 1 && i < this.octaveEnd * 12 + 2;
    },
    isBlackKey(i) {
      return [2,4,7,9,11].includes((i-1)%12+1);
    },
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
}
.white-key {
  fill: white;
  stroke: black;
  stroke-width: 0.5;
  &-down {
    fill: #a7d4a5;
  }
}
.black-key {
  fill: black;
  &-down {
    fill: #5da55a;
  }
}
</style>
