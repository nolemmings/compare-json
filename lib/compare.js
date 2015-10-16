'use strict';

var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');

/**
 * Compares files using glob pattern matcher.
 */
module.exports.compareFilesGlob = function(pattern, done) {
  glob(pattern, { nodir: true }, function(err, files) {
    if (err) return done(err);
    compareFiles(files, done);
  });
}

/**
 * Compares a collection of json files with one-another.
 */
var compareFiles = module.exports.compareFiles = function(files, done) {
  if (files.length === 1) return done(new Error('Require at least two files, found only one "' + files[0] + '"'));
  if (files.length === 0) return done(new Error('Require at least two files, found none'));

  var objects = [];
  _.forEach(files, function(filepath) {
    objects.push(JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' })));
  });
  var diff = compareObjects(objects);
  for (var i = 0; i < files.length; i++) {
    diff[i].file = files[i];
  }
  done(null, diff);
}

/**
 * Returns a collection of arrays where each array contains all elements missing
 * from the corresponding object.
 */
var compareObjects = module.exports.compareObjects = function(objects) {
  var paths = objectsKeyPaths(objects);
  var allPaths = _.uniq(_.flatten(paths));
  var diffs = [];
  for (var i = 0; i < objects.length; i++) {
    diffs.push({
      object: objects[i],
      missingKeys: diffValues(allPaths, paths[i])
    });
  }
  return diffs;
}

/**
 * Creates an array of keypaths of all objects.
 */
function objectsKeyPaths(objects) {
  var paths = [];
  _.forEach(objects, function(object) {
    paths.push(objectKeyPaths(object));
  });
  return paths;
}

/**
 * Creates an array of flattened object key paths.
 *
 * Example:
 * ```
 * var object = { a: { a2: 'test' }, b: 'test' };
 * objectKeyPaths(object); // Returns [ 'a.a2', 'b' ]
 * ```
 */
function objectKeyPaths(object) {
  var result = [];
  _.forOwn(object, function(value, key) {
    if (_.isPlainObject(value)) {
      // Recursive step
      var keys = objectKeyPaths(value);
      _.forEach(keys, function(subKey) {
        result.push(key + '.' + subKey);
      });
    } else {
      result.push(key);
    }
  });
  return result;
}

/**
 * Returns an array with all values in array1 that are missing in array2.
 */
function diffValues(array1, array2) {
  // console.log(_.intersection(array1, array2));
  var diff = [];
  _.forEach(array1, function(value) {
    if (!_.includes(array2, value)) {
      diff.push(value);
    }
  });
  return diff;
}
