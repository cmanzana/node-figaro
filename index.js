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

    if (fs.existsSync(filename)) {
        log.warn(filename + ' already exists, we will not overwrite');
    } else {
        log.info('creating ' + filename);
        fs.writeFileSync(filename, contents);
    }

    if (!skipGitIgnore) {
        var gitIgnoreContents = eol + filename + eol;

        if (!fs.existsSync('.gitignore')) {
            log.info('creating .gitignore and adding ' + filename + ' to it');
            fs.writeFileSync('.gitignore', gitIgnoreContents);
        } else {
            if (fs.readFileSync('.gitignore', 'utf8').indexOf(gitIgnoreContents) == -1) {
                log.info('adding ' + filename + ' to .gitignore');
                var fd = fs.openSync('.gitignore', 'a', null);
                fs.writeSync(fd, gitIgnoreContents, null, 'utf8');
                fs.close(fd);
            } else {
                log.info('.gitignore already ignores ' + filename);
            }
        }
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
            var pkg = JSON.parse(fs.readFileSync('./package.json'));
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
                    callback('could not obtain travis public key for this module:');
                    return;
                }
                callback(null, publicKey);
            }
        });
    } else {
        callback('could not obtain travis slug for this module');
    }
}

exports.travisPublicKey = travisPublicKey;

exports.travisEncrypt = function(filename, slug, values, callback) {
    filename = filename || defaultFilename;

    try {
        var figaroContents = fs.readFileSync(filename);
    } catch (ignore) {
        if (!values) {
            callback(); return;
        }
    }
    var toEncrypt = [];
    for(var i in values) {
        toEncrypt.push(i + '=' + values[i]);
    }

    if (figaroContents) {
        var figaroValues = JSON.parse(figaroContents);
        for(var i in figaroValues) {
            toEncrypt.push(i + '=' + figaroValues[i]);
        }
    }

    travisPublicKey(slug, function(err, publicKey) {
        if (err) {
            callback(err);
        } else {
            try {
                var value = encrypt(publicKey, toEncrypt.join(' '));
            } catch (err) {
                callback(err); return;
            }
            callback(null,value);
        }
    });
}
