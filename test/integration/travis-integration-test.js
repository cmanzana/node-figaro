var assert = require('../lib/extended-assert'),
    figaro = require('../../index');

log.level = 'silent';

var figaroJSONPath = './test/new_file.json';

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

        describe('#decrypt', function () {
            this.timeout(figaro.travis.networkTimeout);
            it('should find PASSWORD environment variable', function (done) {
                if (process.env.TRAVIS === 'true') {
                    assert.equal(process.env.TRAVIS_SECURE_ENV_VARS, 'true');
                    assert.equal(process.env.PASSWORD1, 'SuperSecretPassword');
                    assert.equal(process.env.PASSWORD2, 'AnotherSuperSecretPassword');
                    done();
                } else {
                    done();
                }
            });
        });
    });
});