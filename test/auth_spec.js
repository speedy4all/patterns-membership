const Registration = require('../lib/registration');
const db = require('secondthought');
const assert = require('assert');
const Auth = require('../lib/authentication');

describe('Authentication', function(){
    var reg = {};
    var auth = {};
    before(function (done) {
        db.connect({ db: 'membership' }, function (err, db) {
            reg = new Registration(db);
            auth = new Auth(db);
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership(
                    {
                        email: 'test@test.com',
                        password: 'password',
                        confirm: 'password'
                    }, function (err, regResult) {
                        assert.ok(regResult.success);
                        done();
                    });
            });
        });

    });

    describe('a valid login', function(){
        var authResult = {};
        before(function (done) {
            //log them in...
            auth.authenticate({email : 'test@test.com', password: 'password'}, function(err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
            });
        });
        it('is successful', function(){
            authResult.success.should.equal(true);
        });
        it('returns a user', function() {
            authResult.user.should.be.defined;
        });
        it('creates a log entry', function() {
            authResult.log.should.be.defined;
        });
        it('updates the user stats', function(){
            authResult.user.signInCount.should.equal(2);
        });
        it('updates the signOn dates', function(){
            authResult.user.lastLoginAt.should.be.defined;
            authResult.user.currentLoginAt.should.be.defined;
        });
    });

    describe('empty email', function(){
        var authResult = {};
        before(function (done) {
            //log them in...
            auth.authenticate({email : '', password: 'password'}, function(err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
            });
        });
        it('is not successful', function() {
            authResult.success.should.be.equal(false);
        });
        it('return a message saying "Invalid login"', function(){
            authResult.message.should.be.equal('Invalid email or password');
        });
    });

    describe('empty password', function(){
        var authResult = {};
        before(function (done) {
            //log them in...
            auth.authenticate({email : 'test@test.com', password: ''}, function(err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
            });
        });
        it('is not successful', function() {
            authResult.success.should.be.equal(false);
        });
        it('return a message saying "Invalid login"', function(){
            authResult.message.should.be.equal('Invalid email or password');
        });
    });

    describe('password dosn\'t match', function(){
        var authResult = {};
        before(function (done) {
            //log them in...
            auth.authenticate({email : 'test@test.com', password: 'passwordfail'}, function(err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
            });
        });
        it('is not successful', function() {
            authResult.success.should.be.equal(false);
        });
        it('return a message saying "Invalid login"', function(){
            authResult.message.should.be.equal('Invalid email or password');
        });
    });

    describe('email not found', function(){
        var authResult = {};
        before(function (done) {
            //log them in...
            auth.authenticate({email : 'test-not-found@test.com', password: 'password'}, function(err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
            });
        });
        it('is not successful', function() {
            authResult.success.should.be.equal(false);
        });
        it('return a message saying "Invalid login"', function(){
            authResult.message.should.be.equal('Invalid email or password');
        });
    });
});