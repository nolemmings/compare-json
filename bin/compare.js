#!/usr/bin/env node

var argv = require('yargs')
  .usage('Usage: comparejson -e ./test/*.json')
  .option('groupBy', {
    alias: 'g',
    describe: 'Separates files into different groups using regex',
    type: 'string'
  })
  .option('separator', {
    alias: 's',
    describe: 'Separates files into different groups using a separator string',
    type: 'string'
  })
  .option('ignoreUngrouped', {
    alias: 'i',
    describe: 'Ignore files not part of a specific group',
    default: true,
    type: 'boolean'
  })
  .option('extractedKeysFile', {
    alias: 'k',
    describe: 'Regular expression of file(s) containing keys detected in the code which should not be shown in the result.',
    type: 'string'
  })
  .option('exit', {
    alias: 'e',
    describe: 'Exit with error code when object keys were are missing',
    type: 'boolean'
  })
  .check(function(args) {
    if (args.groupBy && args.separator) {
      throw new Error('Error: cannot use both --separator and --groupBy');
    }
    return true;
  })
  .help('help')
  .wrap(120)
  .argv;

var cli = require('../lib/cli');

cli(argv._, argv);
