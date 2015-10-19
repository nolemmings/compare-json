'use strict';

var compareJson = require('../lib/compare');
var _ = require('lodash');

describe('compare', function() {

  var object1 = null;
  var object2 = null;
  var object3 = null;

  beforeEach(function() {
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
  });

  it('should detect missing keys between objects', function(done) {
    compareJson.compareFiles([
      __dirname + '/test1.json',
      __dirname + '/test2.json',
      __dirname + '/test3.json'
    ], function(err, diff) {
      if (err) return done.fail(err);
      expect(diff[0].missingKeys).toContain('c');
      expect(_.endsWith(diff[0].file, 'test1.json')).toBe(true);
      expect(_.values(diff[0].alternatives.c)).toContain('c');

      expect(diff[1].missingKeys).toEqual([]);
      expect(_.endsWith(diff[1].file, 'test2.json')).toBe(true);

      expect(diff[2].missingKeys).toContain('a.a1.a1a');
      expect(diff[2].missingKeys).toContain('a.a1.a1b');
      expect(diff[2].missingKeys).toContain('a.a2.a2a');
      expect(diff[2].missingKeys).toContain('b');
      expect(_.endsWith(diff[2].file, 'test3.json')).toBe(true);
      expect(_.values(diff[2].alternatives['a.a1.a1a'])).toContain('a.a1.a1a');
      expect(_.values(diff[2].alternatives['b'])).toContain('b');
      expect(_.values(diff[2].alternatives['b'])).toContain('Different value');

      done();
    });
  });

  it('should load files using a glob', function(done) {
    compareJson.compareFilesGlob('./test/*.json', function(err, res) {
      if (err) return done.fail(err);
      expect(res.length).toBe(3);
      done();
    });
  });

  it('should throw an error when only one file was found', function(done) {
    compareJson.compareFilesGlob('*.json', function(err, res) {
      expect(err.message).toBe('Require at least two files, found only one "package.json"');
      done();
    });
  });

  it('should throw an error when no files were found', function(done) {
    compareJson.compareFilesGlob('*.invalid', function(err, res) {
      expect(err.message).toBe('Require at least two files, found none');
      done();
    });
  })
});
