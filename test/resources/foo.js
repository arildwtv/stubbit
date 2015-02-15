var bar = require('./bar');

module.exports = {
    foo: function () {
        return 'foo' + bar.bar();
    }
};
