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
 *   output: console.log, // Output stream function, default `console.log`
 * }
 */
module.exports = function(files, options) {
  var opts = _.defaults({
    exit: false,
    output: console.log
  }, options);

  var output = opts.output;

  compare.compareFiles(files, function(err, results) {
    if (err) {
      output(colors.error(err.message));
      if (opts.exit) {
        process.exit(1);
      }
      return;
    }

    var exitCode = 0;
    _.forEach(results, function(result) {
      if (result.missingKeys && result.missingKeys.length > 0) {
        output(colors.warn(colors.bold(result.file) + ' is missing the following keys:'));
        _.forEach(result.missingKeys, function(missing) {
          output(colors.key(missing));
          _.forOwn(result.alternatives[missing], function(value, key) {
            output(colors.text('  ' + path.basename(key, '.json') + ': ' + value));
            // alternativeText += '  ', path.basename(key, '.json') + ': ' + value
          });
        });
        output('');
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
