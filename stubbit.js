'use strict';

var proxyquire = require('proxyquire').noPreserveCache();
var sinon = require('sinon');
var path = require('path');

module.exports = {
    requireWithStubs: function () {
        if (arguments.length === 0) {
            return;
        }

        var moduleRef = getPathFromParentModule(arguments[0]);

        var dependencyRefs = Array.prototype.splice.call(arguments, 1);

        var mocks = {};

        dependencyRefs.forEach(function (dependencyRef) {
            // If dependency is a local module, make path relative to parent module.
            var dependencyRefRelativeToParent = isLocalModule(dependencyRef)
                ? getPathFromParentModule(dependencyRef)
                : dependencyRef;

            // Remove dependency from require cache, if it exists.
            delete require.cache[require.resolve(dependencyRefRelativeToParent)];

            var dependency = require(dependencyRefRelativeToParent);

            var dependencyType = typeof dependency;

            if (dependencyType === 'function') {
                mocks[dependencyRef] = sinon.stub();
            } else if (dependencyType === 'object') {
                mocks[dependencyRef] = sinon.stub(dependency);
            } else {
                throw new TypeError(
                    'Dependency ' + dependencyRef + ' of type ' + dependencyType +
                    ' is not supported');
            }
        });

        var component = proxyquire(moduleRef, mocks);

        component.__mocks__ = mocks;

        return component;
    },

    getStub: function (module, stubRef, method) {
        var moduleType = typeof module;

        if (moduleType !== 'object' && moduleType !== 'function') {
            throw new TypeError('Module is not an object');
        }

        var stubbedDependency = module.__mocks__[stubRef];

        if (typeof stubbedDependency === 'undefined') {
            throw new Error('Stubbed dependency does not exist');
        }

        if (typeof method !== 'string') {
            return stubbedDependency;
        }

        if (typeof stubbedDependency[method] === 'undefined') {
            throw new TypeError('Stubbed dependency does not have the function ' + method);
        }

        return stubbedDependency[method];
    }
};

function getPathFromParentModule(ref) {
    return path.dirname(module.parent.filename) + '/' + ref;
}

function isLocalModule(ref) {
    return ref.match(/^\.\.?/);
}
