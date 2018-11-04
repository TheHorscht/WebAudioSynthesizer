<template>
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- White keys -->
    <rect v-for="i in 7" :key="'whiteKey'+i"
          :class="['white-key',isWhiteKeyDown_[7-i] ? 'white-key-down' : '']" vector-effect="non-scaling-stroke"
          x="1" :y="[0.1, 12.5, 29.5, 46.5, 58.25, 71, 88][i-1]"
          :height="[12.5, 17, 17, 11.75, 12.75, 17, 12][i-1]"
          @pointerdown="onWhiteKeyDown(7-i, $event)"
          @pointerup="onWhiteKeyUp(7-i, $event)" />
    <!-- Black keys -->
    <template v-for="(v, i) in [2, 4, 6, 9, 11]">
      <rect :key="'blackKey'+i"
            x="0" :y="(v-1) * (100 / 12)"
            width="65%" height="8.33%"
            :class="['black-key', isBlackKeyDown_[4-i] ? 'black-key-down' : '']"
            @pointerdown="onBlackKeyDown(4-i, $event)"
            @pointerup="onBlackKeyUp(4-i, $event)" />
    </template>
  </svg>
</template>
<script>
import '../key-events.js'

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
  data: () => ({
    isWhiteKeyDown_: {},
    isBlackKeyDown_: {},
  }),
  mounted() {
    window.addEventListener('key-event-down-norepeat', e => {
      e = e.detail;
      if(e.code in keysToMidiNote) {
        this.$emit('noteOn', keysToMidiNote[e.code]);
      }
    });
    window.addEventListener('key-event-up', e => {
      e = e.detail;
      this.$emit('noteOff', keysToMidiNote[e.code]);
    });
  },
  methods: {
    onWhiteKeyDown(keyNumber, e) {
      e.target.setPointerCapture(e.pointerId);
      const note = {
        id: 'whiteKey' + keyNumber,
        pitch: 60 + [0,2,4,5,7,9,11][keyNumber],
      };
      this.$set(this.isWhiteKeyDown_, keyNumber, true);
      this.$emit('noteOn', note);
    },
    onWhiteKeyUp(keyNumber, e) {
      e.target.releasePointerCapture(e.pointerId);
      const note = {
        id: 'whiteKey' + keyNumber,
        pitch: 60 + [0,2,4,5,7,9,11][keyNumber],
      };
      this.$set(this.isWhiteKeyDown_, keyNumber, false);
      this.$emit('noteOff', note);
    },
    onBlackKeyDown(keyNumber, e) {
      console.log(keyNumber)
      e.target.setPointerCapture(e.pointerId);
      const note = {
        id: 'blackKey' + keyNumber,
        pitch: 60 + [2, 4, 7, 9, 11][keyNumber] - 1,
      };
      this.$set(this.isBlackKeyDown_, keyNumber, true);
      this.$emit('noteOn', note);
    },
    onBlackKeyUp(keyNumber, e) {
      e.target.releasePointerCapture(e.pointerId);
      const note = {
        id: 'blackKey' + keyNumber,
        pitch: 60 + [2, 4, 7, 9, 11][keyNumber] - 1,
      };
      this.$set(this.isBlackKeyDown_, keyNumber, false);
      this.$emit('noteOff', note);
    }
  },
}
</script>
<style lang="scss" scoped>
svg {
  shape-rendering: crispEdges;
}
.white-key {
  width: 100%;
  fill: white;
  stroke: black;
  stroke-width: 0.5;
  &-down {
    fill: red;
  }
}
.black-key {
  fill: black;
  &-down {
    fill: red;
  }
}
</style>
