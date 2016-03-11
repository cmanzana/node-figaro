var fs = require('fs'),
    os = require('os');

var eol = os.platform
    ? ('win32' == os.platform() ? '\r\n' : '\n')
    : '\n';
exports.eol = eol;

var defaultFigaroJSONPath = 'figaro.json',
    defaultContents = ['{','}'].join(eol),
    defaultGitIgnorePath = '.gitignore';

exports.defaultContents = defaultContents;

exports.readFigaroJSONFile = function(figaroJSONPath) {
    figaroJSONPath = figaroJSONPath || defaultFigaroJSONPath;

    if (fs.existsSync(figaroJSONPath)) {
        return fs.readFileSync(figaroJSONPath, 'utf-8');
    }
};

exports.setup = function (figaroJSONPath, contents, skipGitIgnore, gitIgnorePath) {
    figaroJSONPath = figaroJSONPath || defaultFigaroJSONPath;
    contents = contents || defaultContents;
    gitIgnorePath = gitIgnorePath || defaultGitIgnorePath;

    createFigaroJSONFile(figaroJSONPath, contents);
    if (!skipGitIgnore) {
        addToGitIgnore(gitIgnorePath, figaroJSONPath);
    }
};

/* parses the figaro.json file and loads the variables into the environment */
exports.parse = function(figaroJSONPath, callback) {
	figaroJSONPath = figaroJSONPath || defaultFigaroJSONPath;
	var figaroJSON;
	/* read the file */
	if (fs.existsSync(figaroJSONPath)) {
		fs.readFile(figaroJSONPath, 'utf8', function(err, data) {
			if (err) {
				log.error(err);
                callback(err); return;
			}

			/* json parse */
			figaroJSON = JSON.parse(data);

            /* parse the variables into the environment */
			for (var key in figaroJSON) {
				if (figaroJSON.hasOwnProperty(key)) {
                    log.info("Added " + key + " to the environment");
					process.env[key] = figaroJSON[key];
                }
			}

            callback(null);
		});
	} else {
        var err = "Could not find: " + figaroJSONPath;
		log.error(err);
        callback(err);
	}
};

function createFigaroJSONFile(figaroJSONPath, contents) {
    if (fs.existsSync(figaroJSONPath)) {
        log.warn(figaroJSONPath + ' already exists, we will not overwrite');
    } else {
        log.info('creating ' + figaroJSONPath);
        fs.writeFileSync(figaroJSONPath, contents);
    }
}

function addToGitIgnore(gitIgnorePath, figaroJSONPath) {
    var gitIgnoreContents = eol + figaroJSONPath + eol;

    if (!fs.existsSync(gitIgnorePath)) {
        createGitIgnoreFile(gitIgnorePath, gitIgnoreContents);
    } else {
        appendToGitIgnoreFile(gitIgnorePath, gitIgnoreContents);
    }
}

function createGitIgnoreFile(gitIgnorePath, gitIgnoreContents) {
    log.info('creating .gitignore and adding ' + gitIgnoreContents);
    fs.writeFileSync(gitIgnorePath, gitIgnoreContents);
}

function appendToGitIgnoreFile(gitIgnorePath, gitIgnoreContents) {
    if (alreadyAppendedToGitIgnoreFile(gitIgnorePath, gitIgnoreContents)) {
        log.info('.gitignore already ignores ' + gitIgnoreContents);
    } else {
        log.info('adding to .gitignore ' + gitIgnoreContents);
        var fd = fs.openSync(gitIgnorePath, 'a', null);
        fs.writeSync(fd, gitIgnoreContents, null, 'utf8');
        fs.close(fd);
    }
}

function alreadyAppendedToGitIgnoreFile(gitIgnorePath, gitIgnoreContents) {
    return fs.readFileSync(gitIgnorePath, 'utf8').indexOf(gitIgnoreContents) != -1;
}
