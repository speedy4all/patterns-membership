const Registration = require('../lib/registration');
const db = require('secondthought');

describe('Registration', function () {
    var reg = {};
    before(function (done) {
        db.connect({ db: 'membership' }, function (err, db) {
            reg = new Registration(db);
            done();
        });

    });

    //happy path
    describe('a valid application', function () {
        let regResult = {};
        before(function (done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership(
                    {
                        email: 'speedy4all@gmail.com',
                        password: 'asdasd',
                        confirm: 'asdasd'
                    }, function (err, result) {
                        regResult = result;
                        done();
                    });
            });
        });

        it('is successful', function () {
            regResult.success.should.equal(true);
        });
        it('creates a user', function () {
            regResult.user.should.be.defined;
        });
        it('creates a log entry', function () {
            regResult.log.should.be.defined;
        });
        it("sets the user's status to approved", function () {
            regResult.user.status.should.be.equal('approved');
        });
        it('offers a welcome message', function () {
            regResult.message.should.be.equal('Welcome!');
        });
        it('increment signInCount', function () {
            regResult.user.signInCount.should.be.equal(1);
        });
    });

    describe('an empty or null email', function () {
        let regResult = {};
        before(function (done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership(
                    {
                        email: ''
                    }, function (err, result) {
                        regResult = result;
                        done();
                    });
            });
        });
        it('is not successful', function () {
            regResult.success.should.be.equal(false);
        });
        it('tells user that email is required', function () {
            regResult.message.should.be.equal('Email and password are required');
        });
    });

    describe('empty or null password', function () {
        let regResult = {};
        before(function (done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership(
                    {
                        email: 'speedy4all@gmail.com',
                        password: ''
                    }, function (err, result) {
                        regResult = result;
                        done();
                    });
            });
        });
        it('is not successful', function () {
            regResult.success.should.be.equal(false);
        });
        it('tells user that password is required', function () {
            regResult.message.should.be.equal('Email and password are required');
        });
    });

    describe('password and confirm mismatch', function () {
        let regResult = {};
        before(function (done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership(
                    {
                        email: 'speedy4all@gmail.com',
                        password: 'test',
                        confirm: 'test11111'
                    }, function (err, result) {
                        regResult = result;
                        done();
                    });
            });
        });
        it('is not successful', function () {
            regResult.success.should.be.equal(false);
        });
        it('tells user that password and confirm does not match', function () {
            regResult.message.should.be.equal('Passwords don\'n match');
        });
    });

    describe('email already exists', function () {
        let regResult = {};
        before(function (done) {
            reg.applyForMembership(
                {
                    email: 'speedy4all@gmail.com',
                    password: 'test',
                    confirm: 'test'
                }, function (err, result) {
                    reg.applyForMembership(
                        {
                            email: 'speedy4all@gmail.com',
                            password: 'test',
                            confirm: 'test'
                        }, function (err, result) {
                            regResult = result;
                            done();
                        });
                });
        });
        it('is not successful', function () {
            regResult.success.should.be.equal(false);
        });
        it('tells user that email already exists', function () {
            regResult.message.should.be.equal('This email already exists');
        });
    });


});