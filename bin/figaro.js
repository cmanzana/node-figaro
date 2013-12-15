#!/usr/bin/env node

var figaro = require('../index'),
    nopt = require('nopt'),
    path = require('path'),
    knownOpts = { 'setup': Boolean, 'figaro-file': path, 'skip-gitignore': Boolean, 'travis': [null, String] },
    shorthands = { "?":["--help"], "v":["--version"]},
    options = nopt(knownOpts, shorthands);

if (options.version) {
    console.log(require("../package.json").version)
    process.exit(0);
}

if (options.help) {
    console.log(function () {/*

     Usage:
     figaro <command> <options>

     Manages your project sensitive configuration (e.g.: the settings that you do not want to upload to git).

     Commands:
     --setup            Creates the figaro file where your sensitive configuration will be stored and adds it to your .gitignore.
     --travis [values]  Encrypts the contents of the figaro file together with the optional values.

     Options:
     --skipGitIgnore    Skips updating .gitignore file, default: false
     --figaro-file      File where your sensitive configuration will be stored, default: figaro.json
     --version          Print the version of figaro.
     --help             Print this help.

     Please report bugs!  https://github.com/cmanzana/node-figaro/issues

     */
    }.toString().split(/\n/).slice(1, -2).join("\n"));
    process.exit(0);
}

log.heading = 'figaro';

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

if (options.setup) {
    figaro.setup(options['figaro-file'], null, options['skip-gitignore']);
}

if (options.travis) {
    var values = options.travis === 'true' ? null : JSON.parse(options.travis);
    figaro.travis.encrypt(options['figaro-file'], null, values, function(err, value) {
        if (err) {
            log.error(err);
        } else {
            if (value) {
                log.info('add the following to your .travis.yml file:');
                console.log('env:\n    - secure: "' + value + '"');
                // TODO: we should not need this process.exit(0)!!!
                process.exit(0);
            } else {
                log.warn('no values to encrypt');
            }
        }
    });
}
