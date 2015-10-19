#!/usr/bin/env node

var argv = require('yargs')
  .usage('Usage: comparejson -e ./test/*.json')
  .option('exit', {
    alias: 'e',
    describe: 'exit with error code when object keys were are missing',
    type: 'boolean'
  })
  .help('help')
  .argv;

var cli = require('../lib/cli');

cli(argv._, argv);
