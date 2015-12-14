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
 * Compares a collection of json files with one-another and returns
 */
var compareFiles = module.exports.compareFiles = function(files, done) {
  if (files.length === 1) return done(new Error('Require at least two files, found only one "' + files[0] + '"'));
  if (files.length === 0) return done(new Error('Require at least two files, found none'));

  // Load json files and parse them as regular objects
  var objects = _.map(files, function(filepath) {
    return JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }));
  });

  // Compare all objects
  var diff = compareObjects(objects, files);

  // Find alternatives for missing keys
  _.forEach(diff, function(result) {
    var keys = result.missingPaths;
    result.alternatives = _.zipObject(keys, _.map(keys, function(missingPath) {
      return findAlternatives(diff, missingPath);
    }));
  });
  done(null, diff);
}

/**
 * Returns a collection of arrays where each array contains all elements missing
 * from the corresponding object.
 */
var compareObjects = module.exports.compareObjects = function(objects, files) {
  var paths = _.map(objects, objectPaths);
  var allPaths = _.uniq(_.flatten(paths));

  // Combine object, path and file arrays into a single array with objects
  return _.zipWith(objects, paths, files, function(accumulator, value, index, group) {
    return {
      object: group[0],
      missingPaths: _.difference(allPaths, group[1]),
      file: group[2]
    };
  });
}

/**
 * Creates an array of flattened object key paths.
 *
 * Example:
 * ```
 * var object = { a: { a2: 'test' }, b: 'test' };
 * objectPaths(object); // Returns [ 'a.a2', 'b' ]
 * ```
 */
function objectPaths(object) {
  var result = [];
  _.forOwn(object, function(value, key) {
    if (_.isPlainObject(value)) {
      // Recursive step
      var keys = objectPaths(value);
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
 * Looks for values for defined key in all objects.
 */
function findAlternatives(diff, missingPath) {
  var alternatives = {};
  _.forEach(diff, function(result) {
    var value = _.get(result.object, missingPath);
    if (value) {
      alternatives[result.file] = value;
    }
  });
  return alternatives;
}
