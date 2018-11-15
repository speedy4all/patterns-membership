const Registration = require('../lib/registration');
const db = require('secondthought');

describe('Authentication', function(){

    describe('a valid login', function(){

        it('is successful');
        it('returns a user');
        it('creates a log entry');
        it('updates the user stats');
        it('updates the signon dates');
    });

    describe('empty email', function(){
        
        it('is not successful');
        it('return a message saying "Invalid login"');
    });

    describe('empty password', function(){
        
        it('is not successful');
        it('return a message saying "Invalid login"');
    });

    describe('password dosn\'t match', function(){
        
        it('is not successful');
        it('return a message saying "Invalid login"');
    });

    describe('email not found', function(){
        
        it('is not successful');
        it('return a message saying "Invalid login"');
    });
});