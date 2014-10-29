var highlight = require('highlight.js');

module.exports = transform;

/**
 * Take a set of comments and add additional data to them.
 * @param {Array} comments The comments to be transformed.
 * @return {Array} The transformed comments.
 * @api public
 */
function transform(comments) {
  comments.forEach(transform.comment);
  return comments;
};

/**
 * Take an individual comment add additional data to it.
 * @memberOf transform
 * @param {Object} comment The comment to be transformed.
 * @api public
 */
transform.comment = function(comment) {
  transform.addId(comment);

  comment.tags.forEach(function(tag) {
    transform.tag(comment, tag);
  });

  transform.highlightCode(comment);
  transform.addCtxProps(comment);
  transform.addDescriptors(comment);
  transform.addImportance(comment);
  transform.addTitle(comment);
};

/**
 * A counter for generating a unique id.
 * @type {Number}
 * @api private
 */
var counter = 0;

/**
 * Adds a unique id to a comment.
 * @param {Object} comment The comment that needs an id.
 * @api public
 */
transform.addId = function(comment) {
  comment.id = ++counter;
};

/**
 * Add information to a class based on a tag.
 * @param  {Object} comment The comment to be transformed.
 * @param  {Object} tag     The tag to be parsed.
 * @api public
 */
transform.tag = function(comment, tag) {
  var type = tag.type;

  if (type === 'namespace') {
    comment.namespace = tag.string;
  }

  if (type === 'module') {
    comment.name = tag.string;
  }

  if (type === 'memberOf') {
    comment.parent = tag.parent;
  }

  if ((
    type === 'class' ||
    type === 'mixin' ||
    type === 'method'
  ) && tag.string !== '') {
    comment.name = tag.string;
  }

  if (
    type === 'module' ||
    type === 'class' ||
    type === 'mixin'
  ) {
    comment.type = type;
  }

  if (
    type === 'static' ||
    type === 'instance'
  ) {
    comment.location = type;
  }

  if (type === 'param') {
    comment.params = comment.params || [];
    comment.params.push(tag);
  }

  if (type === 'return') {
    comment.return = tag;
  }

  if (type === 'api') {
    comment.api = tag.visibility;
  }
};

transform.highlightCode = function(comment) {
  if (!comment.code) {
    return;
  }

  comment.code = highlight.highlightAuto(comment.code, ['js']).value;
};

/**
 * Add desciptor properties to a comment.
 * @param {Object} comment The comment to add desciptors to.
 * @api public
 */
transform.addDescriptors = function(comment) {
  comment.isModule      = (comment.type === 'module');
  comment.isClass       = (comment.type === 'class');
  comment.isMixin       = (comment.type === 'mixin');
  comment.isFunction    = (comment.type === 'function');
  comment.isMethod      = (comment.type === 'method');
  comment.isProperty    = (comment.type === 'property');
  comment.isDeclaration = (comment.type === 'declaration');

  comment.isStatic   = (comment.location === 'static');
  comment.isInstance = (comment.location === 'instance');

  comment.isPrivate = (comment.visibility === 'private');
  comment.isPublic  = (comment.visibility === 'public');
};

/**
 * Add an importance property to a comment.
 *
 * This is primarily for heading (`h1`, `h2`) tags. In the future this could be
 * modified to be based on it's parent as well.
 *
 * @param {Object} comment The comment to add an importance property to.
 * @api public
 */
transform.addImportance = function(comment) {
  if (comment.isModule) {
    comment.importance = 1;

  } else if (comment.isClass || comment.isMixin || comment.isFunction) {
    comment.importance = 2;

  } else if (comment.isMethod) {
    comment.importance = 3;

  } else if (comment.isPrivate || comment.isDeclaration) {
    comment.importance = 4;
  }
};

/**
 * If the comment has a `ctx` property, attempt to pull in additional data
 * about the comment.
 * @param {Object} comment The comment to be transformed.
 * @api public
 */
transform.addCtxProps = function(comment) {
  var ctx = comment.ctx;
  if (!ctx) return;

  if (!comment.name && ctx.name) {
    comment.name = ctx.name;
  }

  if (!comment.type && ctx.type) {
    comment.type = ctx.type;
  }

  if (!comment.parent && ctx.receiver) {
    comment.parent = ctx.receiver;
  }
};

/**
 * Adds a semantic title to a comment based on several factors.
 * @param {Object} comment The comment to add a title to.
 * @api public
 */
transform.addTitle = function(comment) {
  var title = '';

  if (comment.parent) {
    title += comment.parent;

    if (comment.isStatic) {
      title += '#';
    } else if (comment.isInstance) {
      title += '::';
    } else {
      title += '.';
    }
  }

  title += comment.name;

  if (comment.isMethod || comment.isFunction) {
    title += '( ';

    if (comment.params) {
      comment.params.forEach(function(param, index) {
        if (index > 0) {
          title += ', ';
        }

        title += param.name;
      });
    }

    title += ' )';
  }

  comment.title = title;
};
