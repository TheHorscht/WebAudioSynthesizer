<template>
  <div id="app">
    <knob :size="50"/>
    <knob :size="75"/>
    <knob :size="100" />
    <div class="ASDR-container">
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <span>A</span>
      <span>S</span>
      <span>D</span>
      <span>R</span>
    </div>
    <vue-slider v-bind="sliderConfig.horizontal" />
    <div class="kb-and-sequencer">
      <vue-keyboard />
      <vue-sequencer ref="sequencer" @noteon="noteon" @noteoff="noteoff" />
    </div>
    <input type="button" value="Play/Pause" @click="togglePlaying">
  </div>
</template>

<script>
import knob from './components/knob'
import vueSlider from 'vue-slider-component'
import vueKeyboard from './components/keyboard'
import vueSequencer from './components/sequencer'
import sliderConfig from './slider-config'
import Voice from './voice'
import './key-events.js'

const audioCtx = new AudioContext();
const voices = {};

let keysToMidiNote = {
	"y": 36,
	"s": 37,
	"x": 38,
	"d": 39,
	"c": 40,
	"v": 41,
	"g": 42,
	"b": 43,
	"h": 44,
	"n": 45,
	"j": 46,
	"m": 47,
	",": 48,
	"l": 49,
	".": 50,
	"ö": 51,
	"-": 52,
	"q": 48,
	"2": 49,
	"w": 50,
	"3": 51,
	"e": 52,
	"r": 53,
	"5": 54,
	"t": 55,
	"6": 56,
	"z": 57,
	"7": 58,
	"u": 59,
	"i": 60,
	"9": 61,
	"o": 62,
	"0": 63,
	"p": 64,
	"ü": 65,
	"Dead": 66,
	"+": 67
};
const generateNewId = (() => {
  let c = 0;
  return () => c++;
})();

export default {
  name: 'app',
  components: {
    knob,
    vueSlider,
    vueKeyboard,
    vueSequencer,
  },
  data: () => ({
    sliderConfig,
  }),
  mounted () {
    window.addEventListener('key-event-down-norepeat', e => {
      e = e.detail;
      if(e.key in keysToMidiNote) {
        this.noteon({ pitch: keysToMidiNote[e.key], id: 'what' + e.key });
      }
    });
    window.addEventListener('keyup', e => {
      this.noteoff({ id: 'what' + e.key });
    });
  },
  methods: {
    noteon({ pitch, id }) {
      const voice = new Voice(audioCtx);
      if(id in voices) {
        voices[id].push(voice);
      } else {
        voices[id] = [voice];
      }
      voice.noteOn(pitch);
      voice.addEventListener('voiceDonePlaying', () => {
        // voices[id].pop();
      });
    },
    noteoff({ id }) {
      if(id in voices) {
        let voice = voices[id].pop();
        voice.noteOff();
      }
    },
    togglePlaying() {
      if(this.$refs.sequencer.playing) {
        this.$refs.sequencer.stop();
        Object.values(voices).forEach(voiceArray => {
          voiceArray.forEach(voice => voice.noteOff());
          voiceArray.length = 0;
        });
      } else {
        this.$refs.sequencer.resume();
      } 
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto');
body {
  user-select: none;
}
.ASDR-container {
  display: inline-grid;
  grid-template-columns: repeat(4, 25px);
  grid-template-rows: auto 20px;
  justify-items: center;
  font-family: 'Roboto', sans-serif;
}
.kb-and-sequencer {
  display: grid;
  grid-template-columns: 100px auto;
  resize: both;
  overflow: scroll;
  
  min-width: 400px;
  min-height: 200px;
  max-width: 800px;
  max-height: 800px;
}
</style>
