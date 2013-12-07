var assert = require('assert'),
    fs = require('fs'),
    figaro = require('../index');

log.level = 'silent';

var contents = '{ "test": "a" }';
var figaroFile = './test/new_file.json';

describe('figaro', function() {
    describe('#travisURL', function() {
        it('should find travis URL', function() {
            assert.equal(figaro.travisURL, 'http://api.travis-ci.org');
        });
    });

    describe('#setup', function() {
        it('should setup a new figaro.json', function() {
            figaro.setup(figaroFile, contents, true);
            var figaroStats = fs.lstatSync(figaroFile);
            assert.ok(figaroStats);
            assert.ok(figaroStats.isFile());

            assert.equal(fs.readFileSync(figaroFile, 'utf8'), contents);

            fs.unlinkSync(figaroFile);
        });

        it('should not overwrite existing file', function() {
            var existingContents = '{ "test": "b" }';
            fs.writeFileSync(figaroFile, existingContents);
            figaro.setup(figaroFile, contents, true);
            assert.equal(fs.readFileSync(figaroFile, 'utf8'), existingContents);
            fs.unlinkSync(figaroFile);
        });
    });

    describe('#travisEncrypt', function() {
        it('should encrypt explicit values', function(done) {
            figaro.travisEncrypt(null, null, {'a': 'b'}, function(err, value) {
                assert.ok(!err);
                assert.ok(value);
                done();
            });
        });

        it('should not encrypt because no values', function(done) {
            figaro.travisEncrypt(null, null, null, function (err, value) {
                assert.ok(!err);
                assert.ok(!value);
                done();
            });
        });
    });

    describe('#travisPublicKey', function() {
        it('should find public key', function(done) {
            figaro.travisPublicKey(null, function(err, publicKey) {
                assert.ok(!err);
                assert.ok(publicKey);
                done();
            });
        });

        it('should not find public key', function(done) {
            figaro.travisPublicKey('mysuperbogus/slug-that-shoud-not-exist', function (err, publicKey) {
                assert.ok(err);
                assert.ok(!publicKey);
                done();
            });
        });
    });
});
