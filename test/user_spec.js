const should = require("should");
const User = require('../models/user');

describe("User", function() {

    describe("Defaults", function() {
        let user = {};
        before(function(){
            user = new User({email: "speedy4all@gmail.com"});
        });

        it("email is speedy4all@gmail.com", function() {
            user.email.should.equal('speedy4all@gmail.com');
        });
        it("has an authentication token", function() {
            user.authenticationToken.should.be.defined;
        });
        it("has a pending status", function() {
            user.status.should.equal('pending');
        });
        it("has a created date", function() {
            user.createdAt.should.be.defined;
        });
        it("has a signInCount of 0", function() {
            user.signInCount.should.equal(0);
        });
        it("has lastLogin", function() {
            user.lastLoginAt.should.be.defined;
        });
        it("has currentLogin", function() {
            user.currentLoginAt.should.be.defined;
        });
     
    });
});