var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var redox = require('./');

redox(['./**/*.js', '!./node_modules/**', '!./assets/**'], { output: './docs'}, function(err, files) {
  if (err) throw err;

  files.forEach(function(file) {
    var filepath = path.resolve(
      './docs', path.dirname(file.filename),
      path.basename(file.filename, path.extname(file.filename)) + '.html'
    );

    mkdirp.sync(path.dirname(filepath));
    fs.writeFileSync(filepath, file.output);
  });
});
