'use strict';

var compareJson = require('../lib/compare');
var compareCli = require('../lib/cli');
var _ = require('lodash');
var glob = require('glob');

describe('compare', function() {

  var object1 = null;
  var object2 = null;
  var object3 = null;
  var fixtures = null;

  beforeEach(function(done) {
    object1 = {
      a: {
        a1: {
          a1a: 'a.a1.a1a',
          a1b: 'a.a1.a1b'
        },
        a2: {
          a2a: 'a.a2.a2a'
        }
      },
      b: 'Test 4'
    };
    object2 = {
      a: {
        a1: {
          a1a: 'a.a1.a1a',
          a1b: 'a.a1.a1b'
        },
        a2: {
          a2a: 'a.a2.a2a'
        }
      },
      b: {
        b1: 'b.b1',
        b2: 'b.b2'
      }
    };
    object3 = {
      c: 'c'
    }
    glob(__dirname + '/fixture/**/*.json', { nodir: true }, function(err, files) {
      if (err) return done(err);
      fixtures = files;
      done(null);
    });
  });

  it('should detect missing keys between objects', function(done) {
    compareJson.compareFiles([
      __dirname + '/fixture/group1-test1.json',
      __dirname + '/fixture/group1-test2.json',
      __dirname + '/fixture/group1-test3.json'
    ], function(err, diff) {
      if (err) return done.fail(err);
      expect(diff[0].missingPaths).toContain('c');
      expect(_.endsWith(diff[0].file, 'test1.json')).toBe(true);
      expect(_.values(diff[0].alternatives.c)).toContain('c');

      expect(diff[1].missingPaths).toEqual([]);
      expect(_.endsWith(diff[1].file, 'test2.json')).toBe(true);

      expect(diff[2].missingPaths).toContain('a.a1.a1a');
      expect(diff[2].missingPaths).toContain('a.a1.a1b');
      expect(diff[2].missingPaths).toContain('a.a2.a2a');
      expect(diff[2].missingPaths).toContain('b');
      expect(_.endsWith(diff[2].file, 'test3.json')).toBe(true);
      expect(_.values(diff[2].alternatives['a.a1.a1a'])).toContain('a.a1.a1a');
      expect(_.values(diff[2].alternatives['b'])).toContain('b');
      expect(_.values(diff[2].alternatives['b'])).toContain('Different value');

      done();
    });
  });

  it('should group files by specified regular expression', function() {
    var groups = compareJson.groupFilesBy(fixtures, "(.+)\-.[^\/]+.");
    expect(groups.length).toBe(4);
    expect(groups[0].length).toBe(3); // group1-*.json
    expect(groups[1].length).toBe(1); // group2-subgroup-*.json
    expect(groups[2].length).toBe(2); // group2-*.json
    expect(groups[3].length).toBe(1); // subfolder/group1-*.json
  });

  it('should contain at least one file to compare', function(done) {
    compareJson.compareFiles([], function(err, diff) {
      expect(err.message).toBe('Require at least one file');
      done();
    });
  });
});
