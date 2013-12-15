var assert = require('./lib/extended-assert'),
    fs = require('fs'),
    figaro = require('../index');

log.level = 'silent';

var figaroJSONPath = './test/new_file.json';
var figaroJSONContents = '{ "test": "a" }';
var gitIgnorePath = './test/.gitignore.test';
var gitIgnoreContents = 'sometext';

describe('figaro', function () {
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
});
