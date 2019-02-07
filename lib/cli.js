const compare = require('./compare');
const colors = require('colors');
const _ = require('lodash');
const path = require('path');
const glob = require('glob');

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
  const opts = _.defaults(options, {
    exit: false,
    output: msg => {
      process.stdout.write(msg + '\n');
    },
    error: msg => {
      process.stderr.write(msg + '\n');
    }
  });

  const allFiles = expandGlob(files);

  // Compare files only against one another in the same group (if enabled)
  let exitCode = 0;
  if (opts.groupBy || opts.separator) {
    if (opts.separator) {
      opts.groupBy = '(.+)\\' + opts.separator + '.[^\\/]+.*';
    }
    const groups = compare.groupFilesBy(allFiles, opts.groupBy, opts.ignoreUngrouped);
    groups.forEach(group => {
      exitCode += compareGroup(group, opts);
    });
  } else {
    exitCode = compareGroup(allFiles, opts);
  }

  if (opts.exit && exitCode > 0) {
    process.exit(1);
  } else if (exitCode === 0) {
    opts.output('No errors found\n');
  }
}

/**
 * Expands file glob "*" and other common file matching patterns.
 * 
 * Windows terminals don't automatically expand globs.
 */
function expandGlob(filePatterns) {
  return filePatterns
    .map(pattern => glob.sync(pattern))
    .reduce((all, val) => all.concat(val), []);
}

/**
 * Compares files and prints the differences between them to output function.
 */
function compareGroup(files, opts) {
  const output = opts.output;
  const error = opts.error;
  return compare.compareFiles(files, (err, results) => {
    if (err) {
      throw err;
    }

    // Suppress errors if filename matches `--suppress-errors` regex
    let displayResults = results;
    if (opts.suppressErrors) {
      displayResults = results.filter(fileDiff => {
        return !new RegExp(opts.suppressErrors).test(fileDiff.file);
      });
    }

    let exitCode = 0;
    displayResults.forEach(result => {
      if (result.missingPaths && result.missingPaths.length > 0) {
        error(colors.warn(colors.bold(result.file) + ' is missing the following keys:'));
        result.missingPaths.forEach(missing => {
          error(colors.key(missing));
          _.forOwn(result.alternatives[missing], (value, key) => {
            error(colors.text('  ' + path.basename(key, '.json') + ': ' + value));
          });
        });
        error('');
        exitCode = 1;
      } else {
        output(colors.info(colors.bold(result.file) + ' is complete\n'));
      }
    });

    return exitCode;
  });
}
