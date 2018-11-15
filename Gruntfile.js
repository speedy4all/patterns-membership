const db = require('secondthought');
const assert = require('assert');
module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['lib/**/*.js', 'models/**/*.js']
        },
        watch: {
            files: ['lib/**/*.js', 'models/**/*.js'],
            tasks: ['jshint']
        }
    });

    grunt.registerTask('installDb', function() {
        const done = this.async();
        db.connect({db: 'membership'}, function(err, db) {
            db.install(['users', 'logs', 'sessions'], function(err, tableResult){
                assert.ok(err === null, err);
                console.log('DB installed ' + tableResult);
                done();
            });
        });
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
}