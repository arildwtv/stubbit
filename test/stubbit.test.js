var stubbit = require('../stubbit');
var assert = require('assert');

describe('stubbit', function () {

    describe('requireWithStubs', function () {
        it('does not stub dependencies that are not explicitly declared', function () {
            var foo = stubbit.requireWithStubs('./resources/foo');
            assert.equal('foobar', foo.foo());
        });

        it('stubs explicitly declared dependencies using empty stubs', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './bar');

            assert.equal('fooundefined', foo.foo());
        });

        it('throws error if module does not exist', function () {
            assert.throws(function () {
                var foo = stubbit.requireWithStubs('./resources/foo2', './bar');
            });
        });

        it('throws error if dependency does not exist', function () {
            assert.throws(function () {
                var foo = stubbit.requireWithStubs('./resources/foo', './bar2');
            });
        });

        it('throws error if dependency is neither an object or a function', function () {
            assert.throws(
                function () {
                    var foo = stubbit.requireWithStubs('./resources/foo', './anumber');
                },
                /Dependency \.\/anumber of type number is not supported/
            );
        });
    });

    describe('getStub', function () {
        it('throws error if module does not exist', function () {
            assert.throws(function () {
                stubbit.getStub('test');
            },
            /Module is not an object/);
        });

        it('throws error if stubbed dependency does not exist', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './bar');

            assert.throws(function () {
                stubbit.getStub(foo, './does-not-exist');
            },
            /Stubbed dependency \.\/does-not-exist does not exist/);
        });

        it('throws error if stubbed dependency does not have the provided method', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './bar');

            assert.throws(function () {
                stubbit.getStub(foo, './bar', 'unknownMethod');
            },
            /Stubbed dependency \.\/bar does not have the function unknownMethod/);
        });

        it('returns the entire stubbed dependency if no method argument is provided', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './bar');

            var stub = stubbit.getStub(foo, './bar');

            assert.ok(typeof stub === 'object');
        });

        it('returns the stubbed method if method argument is provided', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './bar');

            var stubbedMethod = stubbit.getStub(foo, './bar', 'bar');

            assert.ok(stubbedMethod && stubbedMethod.id && stubbedMethod.id.match(/^spy/));
        });

        it('returns the stubbed method which exposes Sinon\'s API', function () {
            var foo = stubbit.requireWithStubs('./resources/foo', './bar');

            // Test Sinon's returns API.
            stubbit.getStub(foo, './bar', 'bar').returns('baz');

            assert.equal('foobaz', foo.foo());
        });
    });
});
