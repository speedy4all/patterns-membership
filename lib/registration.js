const User = require('../models/user');
const Application = require('../models/application');
const assert = require('assert');
const bc = require('bcrypt-nodejs');
const Log = require('../models/log');
const Emitter = require('events').EventEmitter;
const util = require('util');

const RegResult = function () {
    const result = {
        success: false,
        message: null,
        user: null
    };

    return result;
};

const Registration = function (db) {
    Emitter.call(this);
    const self = this;
    let continueWith = null;

    const validateInputs = function (app) {
        if (!app.email || !app.password) {
            app.setInvalid('Email and password are required');
            self.emit('invalid', app);
        } else if (app.password !== app.confirm) {
            app.setInvalid('Passwords don\'n match');
            self.emit('invalid', app);
        } else {
            app.validate();
            self.emit('validated', app);
        }
    };

    const checkIfUserExists = function (app) {
        db.users.exists({ email: app.email }, function(err, exists){
            assert.ok(err===null, err);
            if(exists){
                app.setInvalid('This email already exists');
                self.emit('invalid', app);
            } else {
                self.emit('user-doesnt-exist', app);
            }
        });
    };

    const createUser = function (app) {
        const user = new User(app);
        user.status = 'approved';
        user.signInCount = 1;
        user.hashedPassword = bc.hashSync(app.password); 
        
        db.users.save(user, function(err, newUser) {
            assert.ok(err===null, err);
            app.user = newUser;
            self.emit('user-created', app);
        });
    };

    const addLogEntry = function(app) {
        const log = new Log({
            subject: 'Registration',
            userId: app.user.id,
            entry: 'Successfully Registered'
        });
        db.logs.save(log, function(err, newLog){
            app.log = newLog;
            self.emit('log-created', app);
        });
    };

    self.applyForMembership = function (args, next) {
        continueWith = next;
        
        const app = new Application(args);
        self.emit('application-received', app);
    };

    const registrationOk = function(app) {
        const regResult = new RegResult();
        regResult.success = true;
        regResult.message = 'Welcome!';
        regResult.user = app.user;
        regResult.log = app.log;
        self.emit('registered', regResult);
        if(continueWith) {
            continueWith(null, regResult);
        }
    };
    
    const registrationNotOk = function(app) {
        const regResult = new RegResult();
        regResult.success = false;
        regResult.message = app.message;
        self.emit('not-registered', regResult);
        if(continueWith) {
            continueWith(null, regResult);
        }
    };

    //event wiring
    self.on('application-received', validateInputs);
    self.on('validated', checkIfUserExists);
    self.on('user-doesnt-exist', createUser);
    self.on('user-created', addLogEntry);
    self.on('log-created', registrationOk);
    
    self.on('invalid', registrationNotOk);

    return self;
};

util.inherits(Registration, Emitter);
module.exports = Registration;