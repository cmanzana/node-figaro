var assert = require('./lib/extended-assert'),
    figaro = require('../index');

log.level = 'silent';

var bogusSlug = 'mysuperbogus/slug-that-shoud-not-exist',
    notAvailableFigaroJSONPath = './test/new_file.json',
    figaroJSONPath = './figaro.json',
    invalidPackageJSONPath = './test/does_not_exist_package.json',
    packageJSONWithoutSlugPath = './test/package_without_slug.json',
    invalidPublicKey = 'invalid',
    publicKey =
    '-----BEGIN RSA PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWcUbbQH3fUvtUVFKy6SDRR/mZ\n' +
    'wMMZggNlWv50bJ3hVezGgj7/QOB292PbdBO4T8kR7BAa9HIR+5XsqYmupffyTdo3\n' +
    'whwp+cxXiECVexK6iND1CXu8IoTLutVB3V+Cf5F2KqU8M+HrZq2RRJfYw9D59h3Q\n' +
    '+lb030Vv6pIVPUZGBwIDAQAB\n' +
    '-----END RSA PUBLIC KEY-----\n';

describe('figaro.travis', function () {
    var getPublicKeyHTTP;

    describe('#baseURL', function () {
        it('should find travis base URL', function () {
            assert.equal(figaro.travis.baseURL, 'https://api.travis-ci.org');
        });
    });

    describe('#getPublicKey', function () {
        before(function () {
            getPublicKeyHTTP = figaro.travis.getPublicKeyHTTP;
        });

        it('should find public key', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, 'cmanzana/node-figaro');
                callback(null, publicKey);
            };

            figaro.travis.getPublicKey(null, function (err, publicKey) {
                assert.ok(!err);
                assert.equal(publicKey, publicKey);
                done();
            });
        });

        it('should not find public key', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, bogusSlug);
                callback('error', null);
            };

            figaro.travis.getPublicKey(bogusSlug, function (err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            });
        });

        it('should not find public key because invalid package.json', function (done) {
            figaro.travis.getPublicKey(null, function (err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            }, invalidPackageJSONPath);
        });

        it('should not find public key because package.json without slug', function (done) {
            figaro.travis.getPublicKey(null, function (err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            }, packageJSONWithoutSlugPath);
        });


        after(function () {
            figaro.travis.getPublicKeyHTTP = getPublicKeyHTTP;
        });

    });

    describe('#getPublicKeyHTTP', function() {
        it('should report an error because of an invalid slug', function (done) {
            figaro.travis.getPublicKeyHTTP(' invalid slug ', function(err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            });
        });
    });

    describe('#parsePublicKey', function() {
        it('should report an error if key cannot be found in JSON object', function (done) {
            figaro.travis.parsePublicKey('{}', function(err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            });
        });
        it('should report an error if invalid JSON', function (done) {
            figaro.travis.parsePublicKey('invalid', function (err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            });
        });
    });

    describe('#encrypt', function () {
        before(function () {
            getPublicKeyHTTP = figaro.travis.getPublicKeyHTTP;
        });

        it('should encrypt explicit values', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, 'cmanzana/node-figaro');
                callback(null, publicKey);
            };

            figaro.travis.encrypt(notAvailableFigaroJSONPath, null, {'a':'b'}, function (err, value) {
                assert.ok(!err);
                assert.ok(value);
                done();
            });
        });

        it('should encrypt figaro.json values', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, 'cmanzana/node-figaro');
                callback(null, publicKey);
            };

            figaro.travis.encrypt(figaroJSONPath, null, null, function (err, value) {
                assert.ok(!err);
                assert.ok(value);
                done();
            });
        });

        it('should not encrypt because no values', function (done) {
            figaro.travis.encrypt(notAvailableFigaroJSONPath, null, null, function (err, value) {
                assert.ok(!err);
                assert.ok(!value);
                done();
            });
        });

        it('should not encrypt because of error in getting public key', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, 'cmanzana/node-figaro');
                callback('error', null);
            };

            figaro.travis.encrypt(notAvailableFigaroJSONPath, null, {'a':'b'}, function (err, value) {
                assert.ok(err);
                assert.ok(!value);
                done();
            });
        });

        it('should not encrypt because of invalid public key', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, 'cmanzana/node-figaro');
                callback(null, invalidPublicKey);
            };

            figaro.travis.encrypt(notAvailableFigaroJSONPath, null, {'a':'b'}, function (err, value) {
                assert.ok(err);
                assert.ok(!value);
                done();
            });
        });


        after(function () {
            figaro.travis.getPublicKeyHTTP = getPublicKeyHTTP;
        });
    });
});