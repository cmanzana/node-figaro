var fs = require('fs'),
    rsa = require('rsa'),
    request = require('request'),
    os = require('os');

log = require('npmlog');
log.heading = 'figaro';

var eol = os.platform
    ? ('win32' == os.platform() ? '\r\n' : '\n')
    : '\n';

var defaultContents = [
    '{',
    '}'].join(eol);

var defaultFilename = 'figaro.json';

exports.setup = function(filename, contents, skipGitIgnore) {
    filename = filename || defaultFilename;
    contents = contents || defaultContents;

    fs.lstat(filename, function(err, stats) {
       if (err) {
           log.info('creating ' + filename);
           fs.writeFile(filename, contents);
       } else {
           log.warn(filename + ' already exists, we will not overwrite');
       }
    });

    if (!skipGitIgnore) {
        fs.lstat('.gitignore', function(err, stats) {
            var gitIgnoreContents = filename + eol;
            if (err) {
                log.info('creating .gitignore and adding ' + filename + ' to it');
                fs.writeFile('.gitignore', gitIgnoreContents);
            } else {
                if (fs.readFileSync('.gitignore', 'utf8').indexOf(gitIgnoreContents) == -1) {
                    log.info('adding ' + filename + ' to .gitignore');
                    fs.open('.gitignore', 'a', null, function(err, fd) {
                        fs.write(fd, gitIgnoreContents, null, 'utf8', function() {
                            fs.close(fd);
                        })
                    });
                } else {
                    log.info('.gitignore already ignores ' + filename);
                }
            }
        });
    }
};

function encrypt(publicKey, plaintext) {
    publicKey = publicKey.replace('-----BEGIN RSA PUBLIC KEY-----', '-----BEGIN PUBLIC KEY-----');
    publicKey = publicKey.replace('-----END RSA PUBLIC KEY-----', '-----END PUBLIC KEY-----');

    var keypair = rsa.createRsaKeypair({publicKey: publicKey});

    return keypair.encrypt(plaintext, 'utf8', 'base64');
}


var travisURL = exports.travisURL = 'http://travis-ci.org/';

function travisPublicKey(slug, callback) {
    if (!slug) {
        try {
            var pkg = JSON.parse(fs.readFileSync('../package.json')); //TODO: remove the double dot
            if (pkg.repository && pkg.repository.url) {
                slug = pkg.repository.url.match(/git@github\.com:(.*)\.git$/)[1];
            } else {
                log.error('in order to perform travis encryption I need to know your slug: either you provide it explicitly or you provide your git repository URL in your module package.json');
            }
        } catch (err) {
            log.error('in order to perform travis encryption I need to know your slug: either you provide it explicitly or you execute figaro where your module package.json resides');
        }
    }

    if (slug) {
        var url = travisURL + slug + '.json';
        log.http('GET', url);
        request({'uri': url}, function (err, response, body) {
            if (err) {
                callback(err);
            } else {
                try {
                    var publicKey = JSON.parse(body).public_key;
                } catch (e) {
                    callback(new Error('could not obtain travis public key for this module'));
                }
                callback(null, publicKey);
            }
        });
    } else {
        callback(new Error('could not obtain travis slug for this module'));
    }
}

exports.travisPublicKey = travisPublicKey;

exports.travisEncrypt = function(filename, slug, values) {
    filename = filename || defaultFilename;

    try {
        var figaroContents = fs.readFileSync(filename);
    } catch (ignore) {
        if (!values) {
            log.warn('no values to encrypt');
            return;
        }
    }

    var toEncrypt = [];
    for(var i in values) {
        toEncrypt.push(i + '=' + values[i]);
    }

    var figaroValues = JSON.parse(figaroContents);
    for(var i in figaroValues) {
        toEncrypt.push(i + '=' + figaroValues[i]);
    }

    travisPublicKey(slug, function(err, publicKey) {
        if (err) {
            log.error(err);
        } else {
            try {
                log.info('add the following to your .travis.yml file:');
                console.log('env: {secure: ' + encrypt(publicKey, toEncrypt.join(' ')) + '}');
                log.info('finished');
            } catch (e) {
                log.error(e);
            }
        }
    });
}
