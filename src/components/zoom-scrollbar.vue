<template>
  <div :class="['scrollbar-container', `scrollbar-container-${orientation}`]" ref="scrollbarContainer">
    <div :class="['handle', `handle-${orientation}`]" ref="handle"
         @pointerdown="onPointerDown"
         @pointerup="onPointerUp"
         @pointermove="onPointerMove"
         :style="handleStyle">
         <div :class="['resize-handle', `resize-handle-${orientation}`]" ref="resizeStart"></div>
         <div :class="['resize-handle', `resize-handle-${orientation}`]" ref="resizeEnd"></div>
    </div>
  </div>
</template>
<script>
import clamp from 'clamp'

const MODES = {
  none: 0,
  move: 1,
  resizeStart: 2,
  resizeEnd: 3,
};
export default {
  name: 'ZoomScrollbar',
  props: {
    orientation: {
      type: String,
      default: 'horizontal',
      validator: value => ['horizontal', 'vertical'].indexOf(value) !== -1
    }
  },
  data: () => ({
    start: 0,
    end: 0.5,
    minDistance: 0.1,
    mode: MODES.none
  }),
  methods: {
    onPointerDown (e) {
      if(e.target === this.$refs['handle']) {
        this.mode = MODES.move;
      } else if(e.target === this.$refs.resizeStart) {
        this.mode = MODES.resizeStart;
      } else if(e.target === this.$refs.resizeEnd) {
        this.mode = MODES.resizeEnd;
      }
      e.target.setPointerCapture(e.pointerId)
    },
    onPointerUp (e) {
      e.target.releasePointerCapture(e.pointerId)
    },
    onPointerMove (e) {
      if (e.target.hasPointerCapture(e.pointerId)) {
        let d = this.orientation === 'horizontal'
                ? e.movementX / this.width
                : e.movementY / this.height;
        (({
          [MODES.move]: () => {
            if(this.start + d < 0) {
              this.end -= this.start;
              this.start = 0;
            } else if(this.end + d > 1) {
              this.start += 1 - this.end;
              this.end = 1;
            } else {
              this.start += d;
              this.end += d;
            }
          },
          [MODES.resizeStart]: () => {
            if(this.start + d < 0) {
              this.start = 0;
            } else if(this.end - (this.start + d) > this.minDistance) {
              this.start += d;
            } else {
              this.start = this.end - this.minDistance;
            }
          },
          [MODES.resizeEnd]: () => {
            if(this.end + d > 1) {
              this.end = 1;
            } else if((this.end + d) - this.start > this.minDistance) {
              this.end += d;
            } else {
              this.end = this.start + this.minDistance;
            }
          },
        })[this.mode] || (() => null))();
      }
    },
  },
  computed: {
    width: self => parseInt(window.getComputedStyle(self.$refs.scrollbarContainer).width, 10),
    height: self => parseInt(window.getComputedStyle(self.$refs.scrollbarContainer).height, 10),
    handleStyle: self => ({
      horizontal: {
        left: `${self.start * 100}%`,
        width: `${(self.end - self.start) * 100}%`,
      },
      vertical: {
        top: `${self.start * 100}%`,
        height: `${(self.end - self.start) * 100}%`,
      },
    }[self.orientation]),
  }
}
</script>
<style lang="scss" scoped>
.scrollbar-container {
  border: 1px solid black;
  background: #e8e6e6;
  &-horizontal {
    height: 20px;
  }
  &-vertical {
    width: 20px;
    height: 200px;
  }
}
.handle {
  display: flex;
  justify-content: space-between;
  position: relative;
  border: 1px solid black;
  background: #707070;
  &-horizontal {
    flex-direction: row;
    width: 20px;
    height: calc(100% - 2px);
  }
  &-vertical {
    flex-direction: column;
    width: calc(100% - 2px);
    height: 20px;
  }
}
.resize-handle {
  position: relative;
  &-horizontal {
    cursor: ew-resize;
    width: 10px;
    height: calc(100% + 3px);
    &:first-child {
      left: -5px;
      top: -1px;
    }
    &:last-child {
      right: -5px;
      top: 1px;
    }
  }
  &-vertical {
    cursor: ns-resize;
    height: 10px;
    width: calc(100% + 3px);
    &:first-child {
      top: -5px;
      left: -1px;
    }
    &:last-child {
      bottom: -5px;
      right: -1px;
    }
  }
  &:first-child {
    align-self: flex-start;
  }
  &:last-child {
    align-self: flex-end;
  }
}
</style>


