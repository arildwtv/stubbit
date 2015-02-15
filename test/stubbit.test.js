var stubbit = require('../stubbit');
var assert = require('assert');

describe('stubbit', function () {

    describe('requireWithStubs', function () {
        it('does not stubbit modules that are not explicitly declared', function () {
            var foo = stubbit.requireWithStubs('./resources/foo');
            assert.equal('foobar', foo.foo());
        });

        it('stubs explicitly declared modules using empty stubs', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './resources/bar');

            assert.equal('fooundefined', foo.foo());
        });

        it('throws error if module does not exist', function () {
            assert.throws(function () {
                var foo = stubbit.requireWithStubs('./resources/foo2', './resources/bar');
            });
        });

        it('throws error if dependency does not exist', function () {
            assert.throws(function () {
                var foo = stubbit.requireWithStubs('./resources/foo', './resources/bar2');
            });
        });
    });

    describe('getStub', function () {
        it('throws error if module does not exist', function () {
            assert.throws(function () {
                stubbit.getStub('test');
            });
        });

        it('throws error if stubbed dependency does not exist', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './resources/bar');

            assert.throws(function () {
                stubbit.getStub(foo, './does-not-exist');
            });
        });

        it('throws error if stubbed dependency does not have the provided method', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './resources/bar');

            assert.throws(function () {
                stubbit.getStub(foo, './resources/bar', 'unknownMethod');
            });
        });

        it('returns the entire stubbed dependency if no method argument is provided', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './resources/bar');

            var stub = stubbit.getStub(foo, './resources/bar');

            assert.ok(typeof stub === 'object');
        });

        it('returns the stubbed method if method argument is provided', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './resources/bar');

            var stubbedMethod = stubbit.getStub(foo, './resources/bar', 'bar');

            assert.ok(stubbedMethod && stubbedMethod.id && stubbedMethod.id.match(/^spy/));
        });

        it('returns the stubbed method which exposes Sinon\'s API', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './resources/bar');

            // Test Sinon's returns API.
            stubbit.getStub(foo, './resources/bar', 'bar').returns('baz');

            assert.equal('foobaz', foo.foo());
        });
    });
});
