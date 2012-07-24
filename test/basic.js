var assert = require('assert'),
    figaro = require('../index');

describe('figaro', function() {
    it('should find travis URL', function() {
        assert.equal(figaro.travisURL, 'http://travis-ci.org/');
    });
})
