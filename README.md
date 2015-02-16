# Stubbit

[![NPM version](https://badge.fury.io/js/stubbit.svg)](https://npmjs.org/package/stubbit)
[![Build status](https://secure.travis-ci.org/arildwtv/stubbit.svg?branch=master)](http://travis-ci.org/arildwtv/stubbit)

## Why?

Proxyquire requires (no pun intended) you to define the proxies that you want to use in place of
your dependencies. This is quite cumbersome, which is where Stubbit comes into play. Stubbit wraps
this mechanism, automatically creating SinonJS stubs of your dependencies.

## Installation

`npm install stubbit`

## Usage

Require the module:

    var stubbit = require('stubbit');

The `stubbit` object now has two public methods available:

### stubbit.requireWithStubs(module, ...dependencies)

_Requires a module and stubs its dependencies._

Here is a quick example with two modules and then the test.

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
    var foo = stubbit.requireWithStubs('./foo', './bar');

    /* The bar module is now stubbed... */

### stubbit.getStub(module, dependency [, method])

_Returns the stub of a module dependency. Optionally, you can provide the stubbed method name as an
argument to get access to the stubbed method directly._

Example (with the same modules as the example above):

**foo.test.js:**

    var stubbit = require('stubbit');
    
    var foo = stubbit.requireWithStubs('./foo', './bar');

    /* Get entire stub */
    var stubbedBar = stubbit.getStub(foo, './bar');

    /* Or get stubbed method directly */
    var stubbedBarPrintMethod = stubbit.getStub(foo, './bar', 'print');
