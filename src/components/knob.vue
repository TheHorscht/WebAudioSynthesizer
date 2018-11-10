<template>
  <div class="container">
    <svg :width="size" :height="size" viewBox="0 0 100 100"
          version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g @pointerdown.stop="pointerDown"
         @pointerup.stop="pointerUp"
         @pointermove.stop="pointerMove">
        <circle cx="50" cy="50" r="40" fill="url(#gradient)" />
        <circle cx="50" cy="50" r="35" fill="url(#gradientReversed)" />
      </g>
      <g>
        <line v-for="(tick, i) in ticks" :key="i" class="tickLine"
              :x1="tick.x1" :y1="tick.y1"
              :x2="tick.x2" :y2="tick.y2" />
      </g>
      <line :x1="line.x1" :y1="line.y1"
            :x2="line.x2" :y2="line.y2" />

      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#447799" />
          <stop offset="50%" stop-color="#224488" />
          <stop offset="100%" stop-color="#112266" />
        </linearGradient>
        <linearGradient id="gradientReversed" href="#gradient"
                        gradientTransform="rotate(180, 0.5, 0.5)"/>
      </defs>
    </svg>
  </div>
</template>
<script>
import clamp from 'clamp'

const deg2rad = deg => deg / 360 * Math.PI * 2
const valueConverters = {
  linear: {
    toValue: (p, min, max) => min + (max - min) * p,
    fromValue: (value, min, max) => (value - min) / (max - min),
  },
  log: {
    toValue: (p, min, max) => Math.pow(max - min - 1, p) + min - 1,
    fromValue: (value, min, max) => Math.log(value - min + 1) / Math.log(max - min + 1),
  },
}

export default {
  name: 'knob',
  props: {
    size: {
      type: Number,
      default: 50,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    value: {
      type: Number,
      default: 0,
    },
    scale: {
      type: String,
      default: 'linear',
      validator: value => ['linear', 'log'].indexOf(value) !== -1
    },
    tickCount: {
      type: Number,
      default: 11,
    },
  },
  data: () => ({
  }),
  mounted () {
  },
  methods: {
    pointerDown (e) {
      e.target.setPointerCapture(e.pointerId)
    },
    pointerUp (e) {
      e.target.releasePointerCapture(e.pointerId)
    },
    pointerMove (e) {
      if (e.target.hasPointerCapture(e.pointerId)) {
        let newValue = valueConverters[this.scale].toValue(
          this.knobPosition - e.movementY * 0.005, this.min, this.max)
        newValue = clamp(newValue, this.min, this.max)
        this.$emit('input', newValue)
      }
    },
  },
  computed: {
    line () {
      const angle = deg2rad(180 + 45 + (this.knobPosition * 270) - 90)
      return {
        x1: 50 + Math.cos(angle) * 30,
        y1: 50 + Math.sin(angle) * 30,
        x2: 50 + Math.cos(angle) * 35,
        y2: 50 + Math.sin(angle) * 35,
      }
    },
    ticks () {
      const ticks = []
      for (let i = 0; i < this.tickCount; i++) {
        const p = i / (this.tickCount - 1)
        const angle = deg2rad(180 + 45 + (p * 270) - 90)
        ticks.push({
          x1: 50 + Math.cos(angle) * 45,
          y1: 50 + Math.sin(angle) * 45,
          x2: 50 + Math.cos(angle) * 50,
          y2: 50 + Math.sin(angle) * 50,
        })
      }
      return ticks
    },
    knobPosition: self => valueConverters[self.scale].fromValue(self.value, self.min, self.max)
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: inline-block;
  margin: 3px;
}
svg {
  user-select: none;
  overflow: visible;
  line {
    stroke:white;
    stroke-width: 5;
    pointer-events: none;
    stroke-linecap: round;
  }
  .tickLine {
    stroke:black;
    stroke-width: 3;
  }
}
</style>
