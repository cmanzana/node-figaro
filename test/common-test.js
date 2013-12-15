var assert = require('assert');
require('../lib/common');

describe('figaro', function () {
    describe('#common', function () {
        it('should find logging facility', function () {
            assert.ok(log);
        });
    });
});