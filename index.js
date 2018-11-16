const events = require('events');
const util = require('util');
const Registration = require('./lib/registration');
const Authentication = require('./lib/authentication');
const db = require('secondthought');
const assert = require('assert');

const Membership = function(dbName) {
    var self = this;
    events.EventEmitter.call(self);

    self.findUserByToken = function(token, next) {
        db.connect({db: dbName}, function(err, db){
            assert.ok(err === null, err);
            db.users.first({authenticationToken: token}, next);
        });
    };

    self.authenticate = function(email, password, next) {
        db.connect({db: dbName}, function(err, db){
            const auth = new Authentication(db);

            auth.on('authenticated', function(authResult){
                self.emit('authenticated', authResult);
            });
            auth.on('not-authenticated', function(authResult){
                self.emit('not-authenticated', authResult);
            });

            auth.authenticate({email, password}, next);
        });
    };

    self.register = function(email, password, confirm, next){
        db.connect({db: dbName}, function(err, db){
            const reg = new Registration(db);

            reg.on('registered', function(regResult){
                self.emit('registered', regResult);
            });
            reg.on('not-registered', function(regResult){
                self.emit('not-registered', regResult);
            });

            reg.applyForMembership({email, password, confirm}, next);
        });
    };

};

util.inherits(Membership, events.EventEmitter);
module.exports = Membership;