var assert = module.exports = require('assert');
var fs = require('fs');

function isFile(path) {
    var stats = fs.lstatSync(path);
    assert.ok(stats);
    assert.ok(stats.isFile());
}
assert.isFile = isFile;

function fileContentsEqual(path, expectedContents) {
    assert.equal(fs.readFileSync(path, 'utf8'), expectedContents);
}
assert.fileContentsEqual = fileContentsEqual;

function fileCreatedWithContents(path, contents) {
    assert.isFile(path);
    assert.fileContentsEqual(path, contents);
}
assert.fileCreatedWithContents = fileCreatedWithContents;
