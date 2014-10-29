var glob = require('globby');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var cpr = require('cpr');
var dox = require('dox');
var Handlebars = require('handlebars');
var highlight = require('highlight.js');
var transform = require('./lib/transform');
var helpers = require('./lib/helpers');

module.exports = redox;

dox.setMarkedOptions({
  highlight: function(code, lang) {
    return highlight.highlightAuto(code, [lang]).value;
  }
});

var template = fs.readFileSync(path.resolve('./assets/template.hbs')).toString();

/**
 * Compile html docs for a set of files.
 * @param {String|Array} files A glob of files to run through redox.
 * @param {Object} [opts] Options for redox
 * @param {Function} cb A node-style callback.
 */
function redox(files, opts, cb) {
  try {
    files = glob.sync(files).map(function(filename) {
      var source = fs.readFileSync(path.resolve(filename)).toString();
      var parsed = redox.parse(source);

      var comments = redox.transform(parsed, {
        filename: filename
      });

      var relativeAssetsPath = path.relative(
        filename,
        './'
      );

      var output = redox.compile({
        comments: comments,
        relativeAssetsPath: relativeAssetsPath
      }, {
        template: template
      });

      return { filename: filename, output: output };
    });
  } catch (err) {
    cb(err);
  }

  cb(null, files);
};

redox.parse = function(file, opts) {
  return dox.parseComments(file, opts);
};

redox.transform = function(file, opts) {
  return transform(file, opts);
};

redox.compile = function(file, opts) {
  return Handlebars.compile(opts.template)(file);
};
