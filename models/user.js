const assert = require('assert');
const utility = require('../lib/utility/utility');

const User = function(args){
    assert.ok(args.email, 'Email is required');
    const user = {};
    user.email = args.email;
    user.createdAt = args.createdAt || new Date();
    user.status = args.status || 'pending';
    user.signInCount = args.signInCount || 0;
    user.lastLoginAt = args.lastLoginAt || new Date();
    user.currentLoginAt = args.currentLoginAt || new Date();
    user.authenticationToken = args.authenticationToken || utility.randomString(18);

    return user;
};

module.exports = User;