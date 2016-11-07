'use strict';

var compare = require('./compare');
var colors = require('colors');
var _ = require('lodash');
var path = require('path');

colors.setTheme({
  key: 'cyan',
  text: 'grey',
  info: 'green',
  warn: 'yellow',
  error: 'red'
});

/**
 * Options:
 * {
 *   exit: [boolean], // Process.exit(1) when an error or warning occurred, default false
 *   separator: [string], // Specify a separator to group files by
 *   groupBy: [boolean|string], // Specify a custom regular expression to group files by. This overrides separator.
 *   ignoreUngrouped: [boolean], // Determines whether to ignore files not belonging to any group
 *   output: [function], // Output function, default `process.stdout.write`,
 *   error: [function], // Error function, default `process.stderr.write`
 * }
 */
module.exports = function(files, options) {
  var opts = _.defaults(options, {
    exit: false,
    output: function(msg) { process.stdout.write(msg + '\n'); },
    error: function(msg) { process.stderr.write(msg + '\n'); }
  });
  var exitCode = 0;

  // Compare files only against one another in the same group (if enabled)
  if (opts.groupBy || opts.separator) {
    if (opts.separator) {
      opts.groupBy = '(.+)\\' + opts.separator + '.[^\\\/]+.*';
    }
    var groups = compare.groupFilesBy(files, opts.groupBy, opts.ignoreUngrouped);
    _.forEach(groups, function(group) {
      exitCode += compareGroup(group, opts);
    });
  } else {
    exitCode = compareGroup(files, opts);
  }

  if (exitCode > 0) {
    process.exit(1);
  }
}

/**
 * Compares files and prints the differences between them to output function.
 */
function compareGroup(files, opts) {
  var output = opts.output;
  var error = opts.error;
  return compare.compareFiles(files, function(err, results) {
    if (err) {
      throw err;
    }

    var exitCode = 0;
    _.forEach(results, function(result) {
      if (result.missingPaths && result.missingPaths.length > 0) {
        error(colors.warn(colors.bold(result.file) + ' is missing the following keys:'));
        _.forEach(result.missingPaths, function(missing) {
          error(colors.key(missing));
          _.forOwn(result.alternatives[missing], function(value, key) {
            error(colors.text('  ' + path.basename(key, '.json') + ': ' + value));
          });
        });
        error('');
        exitCode = 1;
      } else if(!opts.onlyErrors) {
        output(colors.info(colors.bold(result.file) + ' is complete\n'));
      }
    });

    if (opts.exit && exitCode > 0) {
      process.exit(exitCode);
    }

    return exitCode;
  });
}
