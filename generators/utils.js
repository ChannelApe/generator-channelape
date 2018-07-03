'use strict';
const _s = require('underscore.string');
const isScoped = require('is-scoped');

exports.slugifyPackageName = name => isScoped(name) ? name : _s.slugify(name);
