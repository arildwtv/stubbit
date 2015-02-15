'use strict';

var proxyquire = require('proxyquire').noPreserveCache();
var sinon = require('sinon');
var path = require('path');

module.exports = {
    requireWithStubs: function () {
        var moduleRef = getPathFromParentModule(arguments[0]);

        var dependencies = Array.prototype.splice.call(arguments, 1);

        var mocks = {};

        dependencies.forEach(function (depRef) {
            var depRefFromParent = getPathFromParentModule(depRef);

            delete require.cache[require.resolve(depRefFromParent)];

            var dependency = require(depRefFromParent);

            mocks[depRef] = sinon.stub(dependency);
        });

        var component = proxyquire(moduleRef, mocks);

        component.__mocks__ = mocks;

        return component;
    },

    getStub: function (module, stubRef, method) {
        if (typeof module !== 'object') {
            throw new Error('Module is not an object');
        }

        var stubbedDependency = module.__mocks__[stubRef];

        if (typeof stubbedDependency !== 'object') {
            throw new Error('Stubbed dependency is not an object');
        }

        if (typeof method !== 'string') {
            return stubbedDependency;
        }

        if (typeof stubbedDependency[method] === 'undefined') {
            throw new Error('Stubbed dependency does not have the function ' + method);
        }

        return stubbedDependency[method];
    }
};

function getPathFromParentModule(ref) {
    return path.dirname(module.parent.filename) + '/' + ref;
}
