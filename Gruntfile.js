module.exports = function (grunt) {
    grunt.initConfig({
        express: {
            dev: {
                options: {
                    script: 'server.js'
                }
            },
            prod: {
                options: {
                    script: 'server.js',
                    node_env: 'production'
                }
            },
            test: {
                options: {
                    script: 'server.js'
                }
            }
        },

        concat: {
            public: {
                src: ['src/utils/Imports.js', 'src/utils/GlobalVariables.js','src/utils/Node.js','src/utils/Run.js','src/utils/Setup.js','src/utils/Init.js', 'src/utils/EventListeners.js',  'src/utils/Animate.js'],
                dest: 'src/public/app.js',
            },
        },
        watch: {
            public: {
                files: ['src/utils/*.js'],
                tasks: ['concat'],
            },
        },

    });
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['concat', 'express:dev', 'watch'])
}