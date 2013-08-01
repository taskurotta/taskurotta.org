module.exports = function(grunt){
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        assemble: {
            pages: {
                options: {
                    collections: [
                        {
                            title: 'mods',
                            inflection: 'mod' // or whatever
                        }
                    ],
                    flatten: true,
                    assets: './assets',
                    helpers: ['src/helpers/helper-*.js'],
                    layoutdir: 'src/_layouts',
                    layout: 'default.hbs',
                    data: [
                        'src/app/*.{json,yml}',
                        'package.json'
                    ],
                    partials: [
                        'src/_includes/*.hbs'
                    ]
                },
                files: {
                    './src/': ['src/app/*.hbs']
                }
            }
        },
        connect: {
            options: {
                hostname: 'localhost'
            },
            server: {
                options: {
                    port: 9000,
                    base: 'src'
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.server.options.port %>'
            }
        },
        watch:{
            livereload: {
                files: ['**/*.js','**/*.html','**/*.css','**/*.yml','**/*.hbs'],
                tasks: ['design']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('assemble');

    grunt.registerTask('server', [
        'assemble',
        'connect:server',
        'open:server',
        'watch'
    ]);
    grunt.registerTask('design', [
        'assemble',
        'watch'
    ]);

};

