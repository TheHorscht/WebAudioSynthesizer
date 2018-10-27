<template>
  <div>
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
          <feOffset result="offOut" in="SourceAlpha" dx="3" dy="3" />
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="1" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>
      </defs>
    </svg>
    <span>{{ value }}</span>
  </div>
</template>
<script>
import clamp from 'clamp'

const deg2rad = deg => deg / 360 * Math.PI * 2
window.d2r = deg2rad

export default {
  name: 'Knob',
  data: () => ({
    size: 100,
    min: 0,
    max: 100,
    value: 0,
    dir: 1,
  }),
  mounted () {
    // this.animate();
  },
  methods: {
    animate () {
      this.value += 1 * this.dir
      if (this.value < this.min || this.value > this.max) {
        this.dir *= -1
      }
      window.requestAnimationFrame(this.animate)
    },
    pointerDown (e) {
      e.target.setPointerCapture(e.pointerId)
      document.body.style = 'pointer-events: none'
    },
    pointerUp (e) {
      e.target.releasePointerCapture(e.pointerId)
      document.body.style = 'pointer-events: initial'
    },
    pointerMove (e) {
      if (e.target.hasPointerCapture(e.pointerId)) {
        if (e.stopPropagation) e.stopPropagation()
        if (e.preventDefault) e.preventDefault()
        e.cancelBubble = true
        e.returnValue = false
        this.value -= e.movementY
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
