# node figaro
[![Build Status](https://secure.travis-ci.org/cmanzana/node-figaro.png)](https://travis-ci.org/cmanzana/node-figaro)
[![Dependency status](https://gemnasium.com/cmanzana/node-figaro.png)](https://gemnasium.com/cmanzana/node-figaro)

npm module to help on configuration of sensitive information on open source projects.
This project is directly inspired by [Figaro](https://github.com/laserlemon/figaro)

[![NPM](https://nodei.co/npm/figaro.png?downloads=true&stars=true)](https://npmjs.org/package/figaro)

## Installation

    $ npm install figaro -g

## Usage

node figaro relies on creating a file (figaro.json) where you will store your sensitive information (passwords, secret keys, etc...) as key/value pairs
The contents of this file can then be used in different environments by encrypting them with the environment public key.

### Options

The options that you can use with node figaro are:

* --skipGitIgnore    Skips updating .gitignore file, default: false
* --figaro-file      File where your sensitive configuration will be stored, default: figaro.json
* --version          Print the version of figaro.
* --help             Print the help of figaro.

### Setup

From the root of your module (where your package.json lives):

    $ figaro --setup

This will generate a figaro.json file and it will be added to your .gitignore
In the figaro.json file you can add something like:

    { "PASSWORD": "SuperSecretPassword" }


### Populate process.env
Simply require figaro and run parse to import all the variables in figaro.json into your nodes environment.

    figaro = require('figaro').parse(figaroJSONPath, callback); // figaroJSONPath can be null and in such case default location of figaro.json is used

### Travis usage

You can encrypt the contents of figaro.json for later usage as environment variables in [travis](http://travis-ci.org)

    $ figaro --travis

This will generate something like:

    env:
      - {secure: "df/EJcOiNPNpPn9i6Nr5cpH1OOYL0FYpXdIY8zpHh7LLfwJ5q4gIwAWSXjXC2NLk13Ki+HsBgph84PX0Bd4/8FCvw6FH8lgkBkjxjG5/tgJ9j8K733CtoxuvVwSMEJsyFEHU1r9JeNx4nyriTu6JhWRnTAYVLQJjhXEncXG4Fsc="}

You can add that to your .travis.yml file safely (it is encrypted using your module public key in travis, so only travis can decrypt it)
And now in travis you will have an environment variable called PASSWORD with value SuperSecretPassword.



## License
[MIT](https://github.com/cmanzana/node-publish/blob/master/MIT-LICENSE)
