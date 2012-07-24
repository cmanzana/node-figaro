var assert = require('assert'),
    figaro = require('../index');

module.exports = {
  'should find travis URL': function() {
      assert.eql(figaro.travisURL, 'http://travis-ci.org/');
  }
};
