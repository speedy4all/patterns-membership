const assert = require('assert');

const Log = function(args) {
    assert.ok(args.subject && args.entry && args.userId, 'Need subject, entry and user id');

    const log = {};
    log.entry = args.entry;
    log.subject = args.subject;
    log.createdAt = new Date();
    log.userId = args.userId;

    return log;
}

module.exports = Log;