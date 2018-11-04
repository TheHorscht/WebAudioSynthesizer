<template>
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect v-for="i in 12" v-if="[1,3,5,7,8,10,12].includes(i)" :key="'whiteKey'+i"
            :class="['white-key', isKeyDown_[48+(12-i)] ? 'white-key-down' : '']" vector-effect="non-scaling-stroke"
            x="1" :y="[0, 0.1,  0, 12.5, 0, 29.5, 0, 46.5,  58.50, 0, 71, 0, 88][i]"
            :height="[0, 12.5, 0, 17,   0, 17,   0, 11.75, 13, 0, 17, 0, 12][i]"
            :data-b="i"
            @pointerdown="keyDown(48+(12-i), $event)"
            @pointerup="keyUp(48+(12-i), $event)" />
      <rect v-for="i in 12" v-if="[2,4,6,9,11].includes(i)" :key="'blackKey'+i"
            x="0" :y="(i-1) * 100/12"
            width="63" :height="100/12"
            :class="['black-key', isKeyDown_[48+(12-i)] ? 'black-key-down' : '']"
            @pointerdown="keyDown(48+(12-i), $event)"
            @pointerup="keyUp(48+(12-i), $event)" />
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
    isKeyDown_: {},
  }),
  mounted() {
    window.addEventListener('key-event-down-norepeat', e => {
      e = e.detail;
      if(e.code in keysToMidiNote) {
        const note = {
          id: 'kb' + keysToMidiNote[e.code],
          pitch: keysToMidiNote[e.code],
        };
        // this.$emit('noteOn', note);
        this.keyDown(keysToMidiNote[e.code]);
      }
    });
    window.addEventListener('key-event-up', e => {
      e = e.detail;
      const note = {
        id: 'kb' + keysToMidiNote[e.code],
        pitch: keysToMidiNote[e.code],
      };
      // this.$emit('noteOff', note);
      this.keyUp(keysToMidiNote[e.code]);
    });
  },
  methods: {
    keyDown(keyNumber, e) {
      if(e) {
        e.target.setPointerCapture(e.pointerId);
      }
      const note = {
        id: 'kb' + keyNumber,
        pitch: keyNumber,
      };
      this.$set(this.isKeyDown_, keyNumber, true);
      this.$emit('noteOn', note);
    },
    keyUp(keyNumber, e) {
      if(e) {
        e.target.releasePointerCapture(e.pointerId);
      }
      if(this.isKeyDown_[keyNumber]) {
        const note = {
          id: 'kb' + keyNumber,
          pitch: keyNumber,
        };
        this.$set(this.isKeyDown_, keyNumber, false);
        this.$emit('noteOff', note);
      }
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
