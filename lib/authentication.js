const events = require('events');
const util = require('util');
const assert = require('assert');
const bc = require('bcrypt-nodejs');
const User = require('../models/user');
const Log = require('../models/log');

const AuthResult = function(creds){
    const result = {
        creds: creds,
        success: false,
        message: 'Invalid email or password',
        user: null,
        log: null
    };

    return result;
};

const Authentication = function(db) {
    var self = this;
    var continueWith = null;
    events.EventEmitter.call(this);

    //validate credentials
    const validateCredentials = function(authResult) {
        if(authResult.creds.email && authResult.creds.password){
            self.emit('creds-ok', authResult);
        } else {
            self.emit('invalid', authResult);
        }
    };
    //find the user
    const findUser = function(authResult) {
        db.users.first({email: authResult.creds.email}, function(err, found){
            assert.ok(err === null, err);
            if(found) {
                authResult.user = new User(found);
                self.emit('user-found', authResult);
            } else {
                self.emit('invalid', authResult);
            }
        });
    };
    //compare the password
    const comparePassword = function(authResult) {
        const matched = bc.compareSync(authResult.creds.password, authResult.user.hashedPassword);
        if(matched) {
            self.emit('password-accepted', authResult);
        } else {
            self.emit('invalid', authResult);
        }
    };
    //bump the stats
    const updateUserStats = function(authResult) {
        const user = authResult.user;
        user.signInCount += 1;
        user.lastLoginAt = user.currentLoginAt;
        user.currentLoginAt = new Date();

        const updates = {
            signInCount: user.signInCount,
            lastLoginAt: user.lastLoginAt,
            currentLoginAt: user.currentLoginAt
        };

        db.users.updateOnly(updates, user.id, function(err, updates) {
            assert.ok(err === null, err);
            self.emit('stats-updated', authResult);
        });
    }; 
    //create log entry
    const createLog = function(authResult) {
        const log = new Log({
            subject: 'Authentication',
            userId: authResult.user.id,
            entry: 'Successfully logged in'
        });
        
        db.logs.save(log, function(err, newLog){
            authResult.log = new Log(newLog);
            self.emit('log-created', authResult);
        });
        
    };

    const authOk = function(authResult) {
        authResult.success = true;
        authResult.message = 'Welcome!';
        self.emit('authenticated', authResult);
        self.emit('completed', authResult);
        if(continueWith){
            continueWith(null, authResult);
        }
    };

    const authNotOk = function(authResult) {
        authResult.success = false;
        self.emit('not-authenticated', authResult);
        self.emit('completed', authResult);
        if(continueWith){
            continueWith(null, authResult);
        }
    };

    //happy path
    self.on('login-received', validateCredentials);
    self.on('creds-ok', findUser);
    self.on('user-found', comparePassword);
    self.on('password-accepted', updateUserStats);
    self.on('stats-updated', createLog);
    self.on('log-created', authOk);

    //ouuups
    self.on('invalid', authNotOk);


    self.authenticate = function(creds, next){
        continueWith = next;
        const authResult = new AuthResult(creds);
      
        self.emit('login-received', authResult);
    };
};

util.inherits(Authentication, events.EventEmitter);

module.exports = Authentication;

