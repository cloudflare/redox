var Handlebars = require('handlebars');

exports.json = function(data, indent) {
  return JSON.stringify(data, null, 2);
};

Handlebars.registerHelper('json', exports.json);
