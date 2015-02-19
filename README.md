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

```javascript
var stubbit = require('stubbit');
```

The `stubbit` object now has two public methods available:

### stubbit.requireWithStubs(module, ...dependencies)

_Requires a module and stubs its dependencies._

* `module (String)`: The relative path to the module you want to require.
* `dependencies (...String)`: The paths to the dependencies, _relative to the module that you require_.

Here is a quick example with two modules and then the test.

**foo.js:**

```javascript
var bar = require('bar');

module.exports = {
    foo: function () {
        return 'foo' + bar.print();
    }
};
```

**bar.js:**

```javascript
module.exports = {
    print: function () {
        return 'bar';
    }
};
```

**foo.test.js:**

```javascript
var stubbit = require('stubbit');
var foo = stubbit.requireWithStubs('./foo', './bar');

/* The bar module is now stubbed... */
```

### stubbit.getStub(module, dependency [, method])

_Returns the stub of a module dependency. Optionally, you can provide the stubbed method name as an
argument to get access to the stubbed method directly._

* `module (object|function)`: The required module containing the mocks.
* `dependency (string)`: The path to the stubbed dependency. This is the same as the path you provided when calling `requireWithStubs`.
* `method (string)`: Optional. The name of the stubbed method, if you want to access this directly.

Example (with the same modules as the example above):

**foo.test.js:**

```javascript
var stubbit = require('stubbit');

var foo = stubbit.requireWithStubs('./foo', './bar');

/* Get entire stub */
var stubbedBar = stubbit.getStub(foo, './bar');

/* Or get stubbed method directly */
var stubbedBarPrintMethod = stubbit.getStub(foo, './bar', 'print');

/* Change stub behavior */
stubbedBarPrintMethod.returns('baz');
```

## Full Example With Mocha

**meal.js**

```javascript
module.exports = {
    get: function () { return 'vegetables'; }
};
```

**person.js**

```javascript
var meal = require('./meal');

module.exports = {
    getBreakfastWishes: function () {
        return 'I want ' + meal.get() + ' for breakfast';
    }
};
```

**person.spec.js**

```javascript
var stubbit = require('stubbit');
var assert = require('assert');

describe('Person', function () {
    it('printBreakfast without stub', function () {
        var person = stubbit.requireWithStubs('./person');
        assert.equal(person.getBreakfastWishes(), 'I want vegetables for breakfast');
    });

    it('printBreakfast with stub', function () {
        var person = stubbit.requireWithStubs('./person', './meal');
        stubbit.getStub(person, './meal', 'get').returns('bacon');
        assert.equal(person.getBreakfastWishes(), 'I want bacon for breakfast');
    });
});
```
