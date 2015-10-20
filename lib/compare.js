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
  var objects = [];
  _.forEach(files, function(filepath) {
    objects.push(JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' })));
  });

  // Compare all objects
  var diff = compareObjects(objects);

  // Add filepath to results
  for (var i = 0; i < files.length; i++) {
    diff[i].file = files[i];
  }

  // Find alternatives for missing keys
  _.forEach(diff, function(result) {
    _.forEach(result.missingKeys, function(missingKey) {
      if (!result.alternatives) {
        result.alternatives = {};
      }
      result.alternatives[missingKey] = findAlternatives(diff, missingKey);
    });
  });
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
 * Returns an array with all keys in array1 that are missing in array2.
 */
function diffValues(array1, array2) {
  var diff = [];
  _.forEach(array1, function(value) {
    if (!_.includes(array2, value)) {
      diff.push(value);
    }
  });
  return diff;
}

/**
 * Looks for values for defined key in all objects.
 */
function findAlternatives(diff, missingKey) {
  var alternatives = {};
  _.forEach(diff, function(result) {
    var value = getValueByPath(result.object, missingKey);
    if (value) {
      alternatives[result.file] = value;
    }
  });
  return alternatives;
}

/**
 * Returns the value using a keypath.
 *
 * Example:
 * ```
 * var object = {
 *   a: { b: { c: 'test' }}
 * }
 * getValueByPath(object, 'a.b''); // Returns `{ c: 'test' }`
 * ```
 */
function getValueByPath(object, path) {
  var props = path.split('.');
  var value = object;
  for (var i = 0; i < props.length; i++) {
    if (i < props.length) {
      if (value[props[i]] === undefined) {
        return null;
      }
      value = value[props[i]];
    }
  }
  return value;
}
