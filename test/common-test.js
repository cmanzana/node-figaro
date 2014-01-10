var assert = require('assert');
require('../lib/common');

describe('figaro', function () {
    describe('#log', function () {
        it('should find logging facility', function () {
            assert.ok(log);
        });
    });

    describe('#join', function() {
        it('should join two existing objects', function () {
            var a = {a: "1"};
            var b = {b: "2"};

            var c = join(a, b);
            assert.equal(c.a, 1);
            assert.equal(c.b, 2);
        });

        it('should join when first is null', function() {
            var a = null;
            var b = {b: "2"};

            var c = join(a, b);
            assert.ok(!c.a);
            assert.equal(c.b, 2);
        });

        it('should join when second is null', function () {
            var a = {a: "1"};
            var b = null;

            var c = join(a, b);
            assert.equal(c.a, 1);
            assert.ok(!c.b);
        });

        it('should not join when both are null', function () {
            var a = null;
            var b = null;

            var c = join(a, b);
            assert.ok(!c);
        });
    });

    describe('#isEmpty', function () {
        it('should say is empty if empty', function () {
            var a = {};

            assert.ok(isEmpty(a));
        });

        it('should say is empty if null', function () {
            var a = null;

            assert.ok(isEmpty(a));
        });

        it('should say is not empty if not empty', function () {
            var a = {a: "1"};

            assert.ok(!isEmpty(a));
        });
    });
});