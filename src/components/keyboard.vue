<template>
  <svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="none">
        <rect v-for="i in 24" v-if="[1,3,5,7,8,10,12].includes((i-1)%12+1)" :key="'whiteKey'+i"
            :class="['white-key', isKeyDown_[48+(12-i)] ? 'white-key-down' : '']" vector-effect="non-scaling-stroke"
            x="0" :y="Math.floor((i-1) / 12) * 100 + [0, 0,  0, 12.5, 0, 29.5, 0, 46.57,  58.33, 0, 71, 0, 88][(i-1)%12+1]"
            width="100"
            :height="[0, 12.5, 0, 17,   0, 17.08,   0, 11.75, 13, 0, 17, 0, 12][(i-1)%12+1]"
            :data-b="i"
            @pointerdown="keyDown(48+(12-i), true, $event)"
            @pointerup="keyUp(48+(12-i), true, $event)" />
      <rect v-for="i in 24" v-if="[2,4,6,9,11].includes((i-1)%12+1)" :key="'blackKey'+i"
            x="0" :y="Math.floor((i-1) / 12) * 100 + ((i-1)%12) * 100/12"
            width="63" :height="100/12"
            :class="['black-key', isKeyDown_[48+(12-i)] ? 'black-key-down' : '']"
            @pointerdown="keyDown(48+(12-i), true, $event)"
            @pointerup="keyUp(48+(12-i), true, $event)" />
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
    }
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
