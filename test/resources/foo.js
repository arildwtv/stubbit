var bar = require('./bar');
var aNumber = require('./anumber');

module.exports = {
    foo: function () {
        return 'foo' + bar.bar();
    }
};
