'use strict';

var proxyquire = require('proxyquire').noPreserveCache();
var sinon = require('sinon');

var path = require('path');

module.exports = {
    /**
     * Requires a module and stubs its dependencies.
     * @param {String} module The path to the module to require, and whose dependencies to stub.
     * @param {String[]} dependencies The dependencies to mock.
     * @return {object|function} The required module, with its dependencies stubbed.
     */
    requireWithStubs: function () {
        if (arguments.length === 0) {
            return;
        }

        // Module reference is always local. In order to require it from stubbit, we need to find
        // its path relative to the stubbit directory.
        var moduleRef = getPathRelativeToStubbitDir(arguments[0]);

        // Remaining arguments are stubs.
        var dependencyRefs = Array.prototype.splice.call(arguments, 1);

        var stubs = {};

        // To require the module's dependencies, we need to know the module's directory path
        // relative to the stubbit directory.
        var moduleDirRelativeToStubbitDir = path.dirname(moduleRef) + '/';

        dependencyRefs.forEach(function (dependencyRef) {

            // If dependency is a local module, make path relative to stubbit directory.
            var dependencyRefRelativeToParent = isLocalModule(dependencyRef)
                ? moduleDirRelativeToStubbitDir + dependencyRef
                : dependencyRef;

            // Remove dependency from require cache, if it exists.
            delete require.cache[require.resolve(dependencyRefRelativeToParent)];

            // Require the actual dependency.
            var dependency = require(dependencyRefRelativeToParent);

            // Stubbit.
            var stubbedDependency = stubs[dependencyRef] = stubDependency(dependency);

            // If the stubbed dependency was not created, alert client.
            if (typeof stubbedDependency === 'undefined') {
                throw new TypeError(
                    'Dependency ' + dependencyRef + ' of type ' + (typeof dependency) +
                    ' is not supported'
                );
            }
        });

        // Feed module and stubbed dependencies into proxyquire.
        var component = proxyquire(moduleRef, stubs);

        // Attach stubs to required module.
        component.__stubs__ = stubs;

        return component;
    },

    /**
     * Returns the stub of a module dependency. Optionally, you can provide the stubbed method name
     * as an argument to get access to the stubbed method directly.
     * @param  {object|function} module The module whose stubbed dependency you want access to.
     * @param  {String} stubRef Reference to the stubbed dependency.
     * @param  {String} method Optional. The stubbed method of the dependency.
     * @return {object|function} The stubbed dependency, or the stubbed method of the dependency if
     * the method argument is provided.
     */
    getStub: function (module, stubRef, method) {
        var moduleType = typeof module;

        // Only accept modules that are objects or functions.
        if (moduleType !== 'object' && moduleType !== 'function') {
            throw new TypeError('Module is not an object');
        }

        var stubbedDependency = module.__stubs__[stubRef];

        if (typeof stubbedDependency === 'undefined') {
            throw new Error('Stubbed dependency ' + stubRef + ' does not exist');
        }

        if (typeof method !== 'string') {
            return stubbedDependency;
        }

        if (typeof stubbedDependency[method] === 'undefined') {
            throw new TypeError(
                'Stubbed dependency ' + stubRef +
                ' does not have the function ' + method);
        }

        return stubbedDependency[method];
    }
};

function getPathRelativeToStubbitDir(ref) {
    var relativePath = path.relative(
        path.dirname(module.filename),
        path.dirname(module.parent.filename));

    if (relativePath.match(/^[^.]/)) {
        relativePath = './' + relativePath;
    }
    
    return relativePath + '/' + ref;
}

function isLocalModule(ref) {
    // If the reference starts with './' or '../'.
    return ref.match(/^\.\.?/);
}

function getModuleDirRelativeToStubbitDir(moduleRef) {
    var pos = moduleRef.lastIndexOf('/');
    return moduleRef.substring(0, pos + 1);
}

function stubDependency(dependency) {
    var dependencyType = typeof dependency;

    if (dependencyType === 'function') {
        return sinon.stub();
    }

    if (dependencyType === 'object') {
        return sinon.stub(dependency);
    }
}
