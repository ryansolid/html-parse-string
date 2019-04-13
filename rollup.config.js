export default {
  input: 'src/index.js',
  output: [{
    file: 'lib/index.js',
    format: 'cjs'
  }, {
    file: 'dist/index.js',
    format: 'es'
  }]
}