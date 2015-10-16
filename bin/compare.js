#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var compare = require('../lib/compare');
var colors = require('colors');
var _ = require('lodash');

if (argv._.length == 1) {}
compare.compareFiles(argv._, function(err, results) {
  if (err) {
    console.log(colors.red(err.message));
    process.exit(1)
  }
  _.forEach(results, function(result) {
    if (result.missingKeys && result.missingKeys.length > 0) {
      console.log(colors.yellow(colors.bold(result.file) + ' is missing the following keys:'));
      _.forEach(result.missingKeys, function(missing) {
        console.log('- ' + missing);
      });
    } else {
      console.log(colors.green(colors.bold(result.file) + ' is complete'));
    }
  });
});
