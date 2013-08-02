module.exports = function(grunt){

    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        src: 'src',
        build: 'build',
        banner: '/**\n' +
            ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' */\n',
        concat: {
            compile_appjs: {
                options: {
                    banner: '<%= banner %>'
                },
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: '<%= src %>/app/',      // Src matches are relative to this path.
                        src: ['**/*.js'], // Actual pattern(s) to match.
                        dest: '<%= build %>/app/',   // Destination path prefix.
                        ext: '.min.js'   // Dest filepaths will have this extension.
                    }
                ]
            },
            compile_modjs: {
                options: {
                    banner: '<%= banner %>'
                },
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: '<%= src %>/mod/',      // Src matches are relative to this path.
                        src: ['**/*.js'], // Actual pattern(s) to match.
                        dest: '<%= build %>/mod/',   // Destination path prefix.
                        ext: '.min.js'   // Dest filepaths will have this extension.
                    }
                ]
            }
        },
        copy: {
            assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= build %>/assets/',
                        cwd: '<%= src %>/assets',
                        expand: true
                    }
                ]
            },
            md: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= build %>/md/',
                        cwd: '<%= src %>/md',
                        expand: true
                    }
                ]
            },
            apphtml: {
                files: [
                    {
                        src: [ '**/*.html' ],
                        dest: '<%= build %>/app/',
                        cwd: '<%= src %>/app/',
                        expand: true
                    }
                ]
            },
            modhtml: {
                files: [
                    {
                        src: [ '**/*.html' ],
                        dest: '<%= build %>/mod/',
                        cwd: '<%= src %>/mod/',
                        expand: true
                    }
                ]
            }
        },
        assemble: {
            pages: {
                options: {
                    collections: ['mods'],
                    flatten: true,
                    assets: '<%= build %>/assets',
                    //helpers: ['src/helpers/helper-*.js'],
                    layoutdir: '<%= src %>/_layouts',
                    layout: 'default.hbs',
                    data: [
                        '<%= src %>/app/*.{json,yml}',
                        'package.json'
                    ],
                    partials: [
                        '<%= src %>/_includes/*.hbs'
                    ]
                },
                files: {
                    '<%= build %>/': ['src/app/*/*.hbs']
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
                    base: '<%= build %>'
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
                files: ['!src/*.html','src/**/*.js','src/**/*.html','src/**/*.css','src/**/*.yml','src/**/*.hbs'],
                tasks: ['design']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('assemble');

    grunt.registerTask('server', [
        'concat',
        'assemble',
        'copy',
        'connect:server',
        'open:server',
        'watch'
    ]);
    grunt.registerTask('design', [
        'concat',
        'assemble',
        'copy'
    ]);

};

