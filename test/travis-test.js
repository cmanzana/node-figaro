var assert = require('./lib/extended-assert'),
    figaro = require('../index');

log.level = 'silent';

var bogusSlug = 'mysuperbogus/slug-that-shoud-not-exist';
var figaroJSONPath = './test/new_file.json';
var thePublicKey =
    '-----BEGIN RSA PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWcUbbQH3fUvtUVFKy6SDRR/mZ\n' +
    'wMMZggNlWv50bJ3hVezGgj7/QOB292PbdBO4T8kR7BAa9HIR+5XsqYmupffyTdo3\n' +
    'whwp+cxXiECVexK6iND1CXu8IoTLutVB3V+Cf5F2KqU8M+HrZq2RRJfYw9D59h3Q\n' +
    '+lb030Vv6pIVPUZGBwIDAQAB\n' +
    '-----END RSA PUBLIC KEY-----\n';

describe('figaro.travis', function () {
    var getPublicKeyHTTP;

    before(function () {
        getPublicKeyHTTP = figaro.travis.getPublicKeyHTTP;
    });

    describe('#baseURL', function () {
        it('should find travis base URL', function () {
            assert.equal(figaro.travis.baseURL, 'https://api.travis-ci.org');
        });
    });

    describe('#getPublicKey', function () {
        it('should find public key', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, 'cmanzana/node-figaro');
                callback(null, thePublicKey);
            };

            figaro.travis.getPublicKey(null, function (err, publicKey) {
                assert.ok(!err);
                assert.equal(publicKey, thePublicKey);
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
    });

    describe('#encrypt', function () {
        it('should encrypt explicit values', function (done) {
            figaro.travis.getPublicKeyHTTP = function (slug, callback) {
                assert.equal(slug, 'cmanzana/node-figaro');
                callback(null, thePublicKey);
            };

            figaro.travis.encrypt(figaroJSONPath, null, {'a':'b'}, function (err, value) {
                assert.ok(!err);
                assert.ok(value);
                done();
            });
        });

        it('should not encrypt because no values', function (done) {
            figaro.travis.encrypt(figaroJSONPath, null, null, function (err, value) {
                assert.ok(!err);
                assert.ok(!value);
                done();
            });
        });
    });

    after(function() {
        figaro.travis.getPublicKeyHTTP = getPublicKeyHTTP;
    });
});