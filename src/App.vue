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
    <div>
      <vue-slider v-bind="sliderConfig.horizontal" :min="80" :max="200" v-model="bpm"/>
      BPM: {{ bpm }}
    </div>
    <div class="kb-and-sequencer">
      <vue-keyboard ref="keyboard" @noteOn="onKeyboardNoteOn" @noteOff="onKeyboardNoteOff"/>
      <vue-sequencer ref="sequencer" @noteOn="onSequencerNoteOn" @noteOff="onSequencerNoteOff"
                     @stop="onSequencerStop"
                     :audioContext="audioCtx"
                     :bpm="bpm" />
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

const voices = {};
const generateNewId = (() => {
  let c = 0;
  return () => c++;
})();

let keyboardTimeouts = [];

window.voices = voices;

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
    audioCtx: new AudioContext(),
    bpm: 120,
  }),
  mounted () {
  },
  methods: {
    onKeyboardNoteOn({ pitch, id }) {
      this.noteOn(id, pitch);
    },
    onKeyboardNoteOff({ pitch, id }) {
      this.noteOff(id, pitch);
    },
    onSequencerNoteOn({ note, whenTime }) {
      const { pitch, id } = note;
      const delay = whenTime - this.audioCtx.currentTime;

      const timeout = window.setTimeout(() => {
        this.$refs.keyboard.keyDown(pitch, false);
        let index = keyboardTimeouts.indexOf(timeout);
        keyboardTimeouts.splice(index, 1);
      }, delay * 1000);
      keyboardTimeouts.push(timeout);

      // this.noteOn(id, pitch, whenTime);
      this.noteOn(id, pitch, whenTime);
    },
    onSequencerNoteOff({ note, whenTime }) {
      const { pitch, id } = note;
      const delay = whenTime - this.audioCtx.currentTime;

      const timeout = window.setTimeout(() => {
        this.$refs.keyboard.keyUp(pitch, false);
        let index = keyboardTimeouts.indexOf(timeout);
        keyboardTimeouts.splice(index, 1);
      }, delay * 1000);
      keyboardTimeouts.push(timeout);

      this.noteOff(id, pitch, whenTime);
    },
    onSequencerStop() {
      this.stopAllNotes();
    },
    stopAllNotes() {
      this.$refs.keyboard.releaseAllKeys();
      keyboardTimeouts.forEach(timeout => {
        window.clearTimeout(timeout);
      })
      keyboardTimeouts = [];
      Object.values(voices).forEach(voiceArray => {
        voiceArray.forEach(voice => voice.noteOff());
        voiceArray.length = 0;
      });
    },
    noteOn(id, pitch, whenTime) {
      const voice = new Voice(this.audioCtx);
      if(id in voices) {
        voices[id].push(voice);
      } else {
        voices[id] = [voice];
      }
      voice.noteOn(pitch, whenTime);
      voice.addEventListener('voiceDonePlaying', () => {
        // voices[id].pop();
      });
    },
    noteOff(id, pitch, whenTime) {
      if(id in voices && voices[id].length > 0) {
        let voice = voices[id].pop();
        voice.noteOff(whenTime);
      }
    },
    togglePlaying() {
      if(this.$refs.sequencer.playing) {
        this.$refs.sequencer.stop();
      } else {
        this.$refs.sequencer.play();
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
  min-height: 400px;
  max-width: 800px;
  max-height: 800px;
}
</style>
