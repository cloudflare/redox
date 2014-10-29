var Handlebars = require('handlebars');

exports.json = function(data, indent) {
  return JSON.stringify(data, null, indent || 2);
};

Handlebars.registerHelper('json', exports.json);
