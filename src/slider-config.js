const common = {
  tooltip: false
}

export default {
  horizontal: {
    ...common,
    width: 200,
    height: 5
  },
  verticalADSR: {
    ...common,
    direction: 'vertical',
    width: 5,
    height: 100,
    tooltip: 'hover',
    'tooltip-dir': 'top',
  },
}
