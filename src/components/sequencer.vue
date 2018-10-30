<template>
  <div :width="width" :height="height">
  <svg width="100%" height="100%">
<!--     <rect v-for="(note, i) in notes" :key="'note' + i"
          :x="i * 10" width="10"
          :y="i * 10" height="10"/> -->
    <defs>
      <pattern id="grid" :width="1 / 16" :height="1 / 12"
        patternUnits="objectBoundingBox"
        patternContentUnits="objectBoundingBox">
        <path d="M 1 0 L 0 0 0 1" fill="none" stroke="gray" stroke-width="0.005"
        vector-effect="non-scaling-stroke" />
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#grid)" />
    <line x1="100%" y1="0" x2="100%" y2="100%" />
    <line x1="0" y1="100%" x2="100%" y2="100%" />
  </svg>
  </div>
</template>
<script>
export default {
    name: 'VueSequencer',
    props: {
      width: {
        type: Number,
        default: 400,
      },
      height: {
        type: Number,
        default: 200,
      },
    },
    data: () => ({
      notes: Array(32).fill(0)
    }),
}
</script>
<style lang="scss" scoped>
line {
  stroke:black;
  stroke-width: 1;
}
div {
  resize: both;
  overflow: scroll;
  
  min-width: 80px;
  min-height: 80px;
  max-width: 800px;
  max-height: 800px;
}
body {
  height: 100%;
}
</style>



