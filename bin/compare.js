#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var cli = require('../lib/cli');

console.log(argv);

cli(argv._, argv);
