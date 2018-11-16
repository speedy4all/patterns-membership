const db = require('secondthought');
const Membership = require('../index');
const assert = require('assert');

describe('Main API', function(){
    var memb = {};
    before(function(done){
        memb = new Membership('membership');
        db.connect({db: 'membership'}, function(err, db){
            db.users.destroyAll(function(err, result){
                done();
            });
        });
    });

    describe('authentication', function(){
        var newUser = {};
        before(function(done){
            memb.register('speedy4all@gmail.com', 'password', 'password', function(err, result){
                newUser = result.user;
                assert.ok(result.success, 'Can\'t register');
                done();
            });
        });

        it('authenticate', function(done){
            memb.authenticate('speedy4all@gmail.com', 'password', function(err, result){
                result.success.should.equal(true);
                done();
            });
        });

        it('gets by token', function(done){
            memb.findUserByToken(newUser.authenticationToken, function(err, result){
                result.should.be.defined;
                done();
            });
        });
    });
});

