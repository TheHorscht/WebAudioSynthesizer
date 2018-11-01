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
    <vue-sequencer ref="sequencer" @noteon="noteon" @noteoff="noteoff" />
    <input type="button" value="Play/Pause" @click="togglePlaying">
  </div>
</template>

<script>
import knob from './components/knob'
import vueSlider from 'vue-slider-component'
import vueSequencer from './components/sequencer'
import sliderConfig from './slider-config'

const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination)
gainNode.gain.value = 0.2;

function playSound(freq) {
  const oscillatorNode = audioCtx.createOscillator();
  oscillatorNode.connect(gainNode);
  oscillatorNode.type = 'sine';
  oscillatorNode.frequency.value = freq;
  oscillatorNode.start(audioCtx.currentTime);
  oscillatorNode.stop(audioCtx.currentTime + 0.5);
}

const midiNoteToFrequency = (function() {
	var midiNoteFrequencies = [];
	for (var x = 0; x < 127; ++x) {
	   midiNoteFrequencies[x] = (440 / 32) * (Math.pow(2, ((x - 9) / 12)));
	}
	return function(midiNoteNumber) {
		return midiNoteFrequencies[midiNoteNumber];
	}
})();

export default {
  name: 'app',
  components: {
    knob,
    vueSlider,
    vueSequencer,
  },
  data: () => ({
    sliderConfig,
  }),
  mounted () {
    
  },
  methods: {
    noteon({ pitch }) {
      playSound(midiNoteToFrequency(pitch));
    },
    noteoff({ pitch }) {
      // stopSound(midiNoteToFrequency(pitch));
    },
    togglePlaying() {
      if(this.$refs.sequencer.playing) {
        this.$refs.sequencer.stop();
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
</style>
