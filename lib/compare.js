'use strict';

var _ = require('lodash');
var fs = require('fs');

/**
 * Groups an array of filepaths using a regular expression.
 *
 * The first capturing group in the regex is used as group matcher.
 *
 * All files not matching the regular expression are grouped together in a
 * separate group unless `ignoreUngrouped` is set to true.
 */
var groupFilesBy = module.exports.groupFilesBy = function(files, pattern, ignoreUngrouped) {
  var result = {};
  files.forEach(function(file) {
    var match = file.match(pattern);
    if (!ignoreUngrouped || match) {
      var group = (match) ? match[1] : 'none';
      if (!result[group]) result[group] = [];
      result[group].push(file);
    }
  });
  return _.values(result);
}

/**
 * Compares a collection of json files with one-another and returns
 */
var compareFiles = module.exports.compareFiles = function(files, done) {
  if (files.length === 0) return done(new Error('Require at least one file'));
  if (files.length === 1) return done(null, [{ file: files[0] }]); // Quick exit

  // Load json files and parse them as regular objects
  var objects = files.map(function(filepath) {
    try {
      return JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }));
    } catch (e) {
      return done(new Error('Error occurred while parsing file "' + filepath + '"'));
    }
  });

  // Compare all objects
  var diff = compareObjects(objects, files);

  // Find alternatives for missing keys
  diff.forEach(function(result) {
    var keys = result.missingPaths;
    result.alternatives = _.zipObject(keys, keys.map(function(missingPath) {
      return findAlternatives(diff, missingPath);
    }));
  });

  return done(null, diff);
}

/**
 * Returns a collection of arrays where each array contains all elements missing
 * from the corresponding object.
 */
var compareObjects = module.exports.compareObjects = function(objects, files) {
  var paths = objects.map(objectPaths);
  var allPaths = _.uniq(_.flatten(paths));

  // Combine object, path and file arrays into a single array with objects
  return _.zipWith(objects, paths, files, function(object, path, file) {
    return {
      object: object,
      missingPaths: _.difference(allPaths, path),
      file: file,
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
      keys.forEach(function(subKey) {
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
  diff.forEach(function(result) {
    var value = _.get(result.object, missingPath);
    if (value) {
      alternatives[result.file] = value;
    }
  });
  return alternatives;
}
