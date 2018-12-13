module.exports = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? '/WebAudioSynthesizer/'
    : '/',
  pages: {
    index: 'src/main.js',
    test: 'src/test.js',
  }
}