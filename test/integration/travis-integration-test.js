var assert = require('../lib/extended-assert'),
    figaro = require('../../index');

log.level = 'silent';

describe('figaro.travis', function () {
    describe('#getPublicKey', function () {
        it('should find public key', function (done) {
            this.timeout(figaro.travis.networkTimeout);
            figaro.travis.getPublicKey(null, function (err, publicKey) {
                assert.ok(!err);
                assert.ok(publicKey);
                done();
            });
        });

        it('should not find public key', function (done) {
            this.timeout(figaro.travis.networkTimeout);
            figaro.travis.getPublicKey('mysuperbogus/slug-that-shoud-not-exist', function (err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            });
        });
    });
});