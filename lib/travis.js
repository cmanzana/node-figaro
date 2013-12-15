var figaro = require('./figaro'),
    fs = require('fs'),
    ursa = require('ursa'),
    request = require('request');

var baseURL = exports.baseURL = 'https://api.travis-ci.org';
var repositoriesURL = baseURL + '/repos';
var networkTimeout = exports.networkTimeout = 5000;

function getPublicKey(slug, callback) {
    if (!slug) {
        slug = getSlugFromPackageJSON();
    }

    if (slug) {
        exports.getPublicKeyHTTP(slug, callback);
    } else {
        callback('could not obtain travis slug for this module');
    }
}
exports.getPublicKey = getPublicKey;

function getSlugFromPackageJSON() {
    var slug;
    try {
        var pkg = JSON.parse(fs.readFileSync('./package.json'));
        if (pkg.repository && pkg.repository.url) {
            slug = pkg.repository.url.match(/git@github\.com:(.*)\.git$/)[1];
        } else {
            log.error(
                'in order to perform travis encryption I need to know your slug: either you provide it explicitly ' +
                    'or you provide your git repository URL in your module package.json');
        }
    } catch (err) {
        log.error(
            'in order to perform travis encryption I need to know your slug: either you provide it explicitly ' +
                'or you execute figaro where your module package.json resides');
    }
    return slug;
}

function getPublicKeyHTTP(slug, callback) {
    var url = repositoriesURL + '/' + slug + '/key';
    log.http('GET', url);

    request({'uri':url, 'timeout':networkTimeout}, function (err, response, body) {
        if (err) {
            callback(err);
        } else {
            parsePublicKey(body, callback);
        }
    });
}
exports.getPublicKeyHTTP = getPublicKeyHTTP;

function parsePublicKey(publicKeyJSON, callback) {
    try {
        var publicKey = JSON.parse(publicKeyJSON).key;
        if (publicKey == null) {
            callback('could not obtain travis public key for this module');
        } else {
            callback(null, publicKey);
        }
    } catch (e) {
        callback('could not obtain travis public key for this module');
    }
}

exports.encrypt = function(figaroJSONPath, slug, values, callback) {
    values = values || new Object();
    var valuesFromFigaroJSONFile = getFigaroKeyValuePairs(figaroJSONPath);
    values = join(values, valuesFromFigaroJSONFile);

    if (isEmpty(values)) {
        callback();
    } else {
        getPublicKey(slug, function (err, publicKey) {
            if (err) {
                callback(err);
            } else {
                try {
                    var toEncrypt = encodeFigaroKeyValuePairs(values);
                    var value = encrypt(publicKey, toEncrypt);
                } catch (err) {
                    callback(err);
                    return;
                }
                callback(null, value);
            }
        });
    }
};

function getFigaroKeyValuePairs(figaroJSONPath) {
    var figaroValues = null;

    try {
        var figaroContents = figaro.readFigaroJSONFile(figaroJSONPath);
        if (figaroContents) {
            figaroValues = JSON.parse(figaroContents);
        }
    } catch (ignore) {
    }

    return figaroValues;
}

function encodeFigaroKeyValuePairs(values) {
    var encoded = [];

    for (var i in values) {
        encoded.push(i + '=' + values[i]);
    }

    return encoded.join(' ');
}

function encrypt(publicKey, plaintext) {
    publicKey = publicKey.replace('-----BEGIN RSA PUBLIC KEY-----', '-----BEGIN PUBLIC KEY-----');
    publicKey = publicKey.replace('-----END RSA PUBLIC KEY-----', '-----END PUBLIC KEY-----');

    var key = ursa.createPublicKey(publicKey, 'utf8');

    return key.encrypt(plaintext, 'utf8', 'base64', ursa.RSA_PKCS1_PADDING);
}

