<template>
  <div class="container">
    <svg :width="size" :height="size" viewBox="0 0 100 100"
          version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g @pointerdown.stop="pointerDown"
         @pointerup.stop="pointerUp"
         @pointermove.stop="pointerMove"
         filter="url(#shadow)">
        <circle cx="50" cy="50" r="50" fill="url(#gradient)" />
        <circle cx="50" cy="50" r="45" fill="url(#gradientReversed)" />
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
        <filter id="shadow" x="0" y="0" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="2"/>
        </filter>
      </defs>
    </svg>
  </div>
</template>
<script>
import clamp from 'clamp'

const deg2rad = deg => deg / 360 * Math.PI * 2

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
      default: 50,
    },
  },
  data: () => ({
  }),
  methods: {
    pointerDown (e) {
      e.target.setPointerCapture(e.pointerId)
    },
    pointerUp (e) {
      e.target.releasePointerCapture(e.pointerId)
    },
    pointerMove (e) {
      if (e.target.hasPointerCapture(e.pointerId)) {
        this.value -= e.movementY * 0.5;
      }
    },
  },
  computed: {
    line () {
      const angle = deg2rad(180 + 45 + (this.p * 270) - 90)
      return {
        x1: 50 + Math.cos(angle) * 30,
        y1: 50 + Math.sin(angle) * 30,
        x2: 50 + Math.cos(angle) * 50,
        y2: 50 + Math.sin(angle) * 50,
      }
    },
    p: self => self.value / self.max,
  },
  watch: {
    value (newValue, oldValue) {
      this.value = clamp(newValue, this.min, this.max)
    }
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
}
</style>
