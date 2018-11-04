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
      <vue-keyboard ref="keyboard" @noteOn="noteOn($event, 'kb')" @noteOff="noteOff($event, 'kb')"/>
      <vue-sequencer ref="sequencer" @noteOn="noteOn($event, 'sq')" @noteOff="noteOff($event, 'sq')" />
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

const audioCtx = new AudioContext();
const voices = {};
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
  },
  methods: {
    noteOn({ pitch, id }, source) {
      if(source === 'sq') {
        this.$refs.keyboard.keyDown(pitch - 12);
      } else {
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
      }
    },
    noteOff({ pitch, id }, source) {
      if(source === 'sq') {
        this.$refs.keyboard.keyUp(pitch - 12);
      } else {
        if(id in voices) {
          let voice = voices[id].pop();
          voice.noteOff();
        }
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
  min-height: 400px;
  max-width: 800px;
  max-height: 800px;
}
</style>
