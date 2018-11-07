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
      <vue-keyboard ref="keyboard" @noteOn="onKeyboardNoteOn" @noteOff="onKeyboardNoteOff"/>
      <vue-sequencer ref="sequencer" @noteOn="onSequencerNoteOn" @noteOff="onSequencerNoteOff" :audioContext="audioCtx" />
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
  }),
  mounted () {
  },
  methods: {
    onKeyboardNoteOn({ pitch, id }) {
      console.log(`NoteOn. Pitch: ${pitch}, Id: ${id}`);
      this.noteOn(id, pitch, 0);
    },
    onKeyboardNoteOff({ pitch, id }) {
      console.log(`NoteOff. Pitch: ${pitch}, Id: ${id}`);
      this.noteOff(id, pitch, 0);
    },
    onSequencerNoteOn({ pitch, id, delay }) {
      this.$refs.keyboard.keyDown(pitch - 12, false);
    },
    onSequencerNoteOff({ pitch, id, delay }) {
      this.$refs.keyboard.keyUp(pitch - 12, false);
    },
    noteOn(id, pitch, delay) {
      const voice = new Voice(this.audioCtx);
      if(id in voices) {
        voices[id].push(voice);
      } else {
        voices[id] = [voice];
      }
      voice.noteOn(pitch, delay);
      voice.addEventListener('voiceDonePlaying', () => {
        // voices[id].pop();
      });
    },
    noteOff(id, pitch, delay) {
      if(id in voices) {
        let voice = voices[id].pop();
        voice.noteOff(delay);
      }
    },
    togglePlaying() {
      if(this.$refs.sequencer.playing) {
        this.$refs.sequencer.stop();
        this.$refs.keyboard.releaseAllKeys();
        Object.values(voices).forEach(voiceArray => {
          voiceArray.forEach(voice => voice.noteOff());
          voiceArray.length = 0;
        });
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
