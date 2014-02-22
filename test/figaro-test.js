var assert = require('./lib/extended-assert'),
    fs = require('fs'),
    figaro = require('../index');

log.level = 'silent';

var figaroJSONPath = './test/new_file.json',
    figaroJSONPathTest = './test/figaro_test.json',
    figaroJSONPathDoesNotExist = './test/does_not_exist.json',
    figaroJSONContents = '{ "test": "a" }',
    gitIgnorePath = './test/.gitignore.test',
    gitIgnoreContents = 'sometext';

describe('figaro', function () {
    describe('#readFigaroJSONFile', function() {
        it('should read the figaro json file in this project', function() {
            var contents = figaro.readFigaroJSONFile();
            assert.ok(contents);
        });

        it('should not read anything as there is no figaro json file', function() {
            var contents = figaro.readFigaroJSONFile(figaroJSONPath);
            assert.ok(!contents);
        });
    });

    describe('#setup', function () {
        it('should setup a new figaro json file with provided contents', function () {
            figaro.setup(figaroJSONPath, figaroJSONContents, true);

            assert.fileCreatedWithContents(figaroJSONPath, figaroJSONContents);
            fs.unlinkSync(figaroJSONPath);
        });

        it('should setup a new figaro json file with default contents', function () {
            figaro.setup(figaroJSONPath, null, true);

            assert.fileCreatedWithContents(figaroJSONPath, figaro.defaultContents);
            fs.unlinkSync(figaroJSONPath);
        });

        it('should not overwrite existing figaro json file', function () {
            var existingContents = '{ "test": "b" }';
            fs.writeFileSync(figaroJSONPath, existingContents);

            figaro.setup(figaroJSONPath, figaroJSONContents, true);

            assert.fileContentsEqual(figaroJSONPath, existingContents);
            fs.unlinkSync(figaroJSONPath);
        });

        it('should not overwrite existing figaro json file of this project', function() {
            var existingContents = figaro.readFigaroJSONFile();

            figaro.setup(null, figaroJSONContents, true);

            assert.equal(figaro.readFigaroJSONFile(), existingContents);
        });

        it('should setup a new figaro json file with default contents and create a new git ignore file', function() {
            figaro.setup(figaroJSONPath, null, false, gitIgnorePath);

            assert.fileCreatedWithContents(figaroJSONPath, figaro.defaultContents);
            fs.unlinkSync(figaroJSONPath);
            assert.fileCreatedWithContents(gitIgnorePath, figaro.eol + figaroJSONPath + figaro.eol);
            fs.unlinkSync(gitIgnorePath);
        });

        it('should not re-append if it already appears in existing git ignore file', function () {
            figaro.setup(figaroJSONPath, null, false, gitIgnorePath);
            figaro.setup(figaroJSONPath, null, false, gitIgnorePath);

            assert.fileCreatedWithContents(figaroJSONPath, figaro.defaultContents);
            fs.unlinkSync(figaroJSONPath);
            assert.fileCreatedWithContents(gitIgnorePath, figaro.eol + figaroJSONPath + figaro.eol);
            fs.unlinkSync(gitIgnorePath);
        });

        it('should append if it does not appear in existing git ignore file', function () {
            fs.writeFileSync(gitIgnorePath, gitIgnoreContents);
            figaro.setup(figaroJSONPath, null, false, gitIgnorePath);

            assert.fileCreatedWithContents(figaroJSONPath, figaro.defaultContents);
            fs.unlinkSync(figaroJSONPath);
            assert.fileCreatedWithContents(gitIgnorePath, gitIgnoreContents + figaro.eol + figaroJSONPath + figaro.eol);
            fs.unlinkSync(gitIgnorePath);
        });
    });

    describe('#parse', function () {
        it('should not find figaro json file', function(done) {
            figaro.parse(figaroJSONPathDoesNotExist, function(err) {
                assert.ok(err);
                assert.ok(!process.env['TEST1']);
                assert.ok(!process.env['TEST2']);
                done();
            });
        });

        it('should add figaro entries to process.env', function(done) {
            figaro.parse(figaroJSONPathTest, function(err) {
                assert.ok(!err);
                assert.equal(process.env['TEST1'], 'test contents 1');
                assert.equal(process.env['TEST2'], 'test contents 2');
                done();
            });
        });

        it('should add figaro entries to process.env from default figaro.json', function (done) {
            figaro.parse(null, function (err) {
                assert.ok(!err);
                assert.ok(process.env['PASSWORD1']);
                assert.ok(process.env['PASSWORD2']);
                done();
            });
        });

    });
});
