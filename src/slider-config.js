const common = {
  tooltip: false
}

export default {
  horizontal: {
    ...common,
    width: 200,
    height: 10
  },
  vertical: {
    ...common,
    direction: 'vertical',
    width: 10,
    height: 200,
  },
}
