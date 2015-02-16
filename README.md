# Stubbit

[![NPM version](https://badge.fury.io/js/stubbit.svg)](https://npmjs.org/package/stubbit)
[![Build status](https://secure.travis-ci.org/arildwtv/stubbit.svg?branch=master)](http://travis-ci.org/arildwtv/stubbit)

## Installation

`npm install stubbit`

## Usage

Require the module:

    var stubbit = require('stubbit');

The `stubbit` object now has two public methods available:

### stubbit.requireWithStubs(modulePath, ...dependencyPaths)

Requires a module and stubs its dependencies.

Example:

**foo.js:**

    var bar = require('bar');

    module.exports = {
        foo: function () {
            return 'foo' + bar.print();
        }
    }

**bar.js:**

    module.exports = {
        print: function () {
            return 'bar';
        }
    };

**foo.test.js:**

    var stubbit = require('stubbit');
    var fooWithStubbedBar = stubbit.requireWithStubs('./foo', './bar');

    /* Use fooWithStubbedBar for testing... */

### stubbit.getStub(module, dependency [, method])

Returns the stub of a module dependency. Optionally, you can provide the stubbed method name as an
argument to get access to the stubbed method directly.

Example (with the same modules as the example above):

**foo.test.js:**

    var stubbit = require('stubbit');
    
    var fooWithStubbedBar = stubbit.requireWithStubs('./foo', './bar');

    /* Get entire stub */
    var stubbedBar = stubbit.getStub(fooWithStubbedBar, './bar');

    /* Or get stubbed method */
    var stubbedBarPrintMethod = stubbit.getStub(fooWithStubbedBar, './bar', 'print');
