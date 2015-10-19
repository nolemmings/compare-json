'use strict';

var compare = require('../lib/compare');
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
 *   exit: false, // Process.exit(1) when an error or warning occurred, default false
 *   output: stdout, // Output function, default `process.stdout.write`,
 *   error: stderr, // Error function, default `process.stderr.write`
 * }
 */
module.exports = function(files, options) {
  var opts = _.defaults(options, {
    exit: false,
    output: function(msg) { process.stdout.write(msg + '\n'); },
    error: function(msg) { process.stderr.write(msg + '\n'); }
  });

  var output = opts.output;
  var error = opts.error;

  compare.compareFiles(files, function(err, results) {
    if (err) {
      error(colors.error(err.message));
      if (opts.exit) {
        process.exit(1);
      }
      return;
    }

    var exitCode = 0;
    _.forEach(results, function(result) {
      if (result.missingKeys && result.missingKeys.length > 0) {
        error(colors.warn(colors.bold(result.file) + ' is missing the following keys:'));
        _.forEach(result.missingKeys, function(missing) {
          error(colors.key(missing));
          _.forOwn(result.alternatives[missing], function(value, key) {
            error(colors.text('  ' + path.basename(key, '.json') + ': ' + value));
            // alternativeText += '  ', path.basename(key, '.json') + ': ' + value
          });
        });
        error('');
        exitCode = 1;
      } else {
        output(colors.info(colors.bold(result.file) + ' is complete\n'));
      }
    });

    if ((opts.exit || opts.e) && exitCode > 0) {
      process.exit(1);
    }
    return;
  });
}
