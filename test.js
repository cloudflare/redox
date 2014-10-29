var fs = require('fs');
var path = require('path');
var redox = require('./');

redox(['./**/*.js', '!./node_modules/**', '!./assets/**'], { output: './docs'}, function(err, files) {
  if (err) throw err;

  console.log(files);
});
