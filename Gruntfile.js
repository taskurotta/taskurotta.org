module.exports = function(grunt){

    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        src: 'src',
        build: 'build',
        mods: ['app', 'footer','navigation','markdown'],
        apps: ['get_started', 'index', 'road_map'],

        banner: '/**\n' +
            ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' */\n',
        concat: {
            options: {
                banner: '<%= banner %>',
                separator: '\n /* ------------- */ \n',
                nonull: true

            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
               'Gruntfile.js',
                '<%= src %>/app/*/scripts/{,*/}*.js',
                '<%= src %>/mod/*/*/scripts/{,*/}*.js'
            ]
        },
        ngmin: {
            app: {
                files: [{
                    expand: true,
                    cwd: '<%= build %>/app',
                    src: [ '**/*.js' ,'!**/*.min.js'],
                    dest: '<%= build %>/app/',
                    ext: '.min.js'
                }]
            },
            mod: {
                files: [{
                    expand: true,
                    cwd: '<%= build %>/mod',
                    src: [ '**/*.js' ,'!**/*.min.js'],
                    dest: '<%= build %>/mod/',
                    ext: '.min.js'
                }]
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
            htmlApp: {
                files: [
                    {
                        src: [ '**/*.html' ],
                        dest: '<%= build %>/app/',
                        cwd: '<%= src %>/app/',
                        expand: true
                    }
                ]
            },
            htmlMod: {
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
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= build %>/*',
                        '!<%= build %>/vendor'
                    ]
                }]
            },
            server: '.tmp'
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('assemble');

    grunt.registerTask('concat_scripts', 'concat scripts', function() {
        grunt.file.expand({filter:'isDirectory',cwd:'src'},
            'mod/*/*').forEach(function (dir) {
            var concat = grunt.config.get('concat') || {};
            concat[dir] = {
                src: ['<%= src %>/'+dir + '/scripts/*.js'],
                dest: '<%= build %>/'+dir + '/scripts/mod.js'
            };
            grunt.config.set('concat', concat);
        });
        grunt.file.expand({filter:'isDirectory',cwd:'src'},
            'app/*').forEach(function (dir) {
            var concat = grunt.config.get('concat') || {};
            concat[dir] = {
                src: ['<%= src %>/'+dir + '/scripts/*.js'],
                dest: '<%= build %>/'+dir + '/scripts/app.js'
            };
            grunt.config.set('concat', concat);
        });
        grunt.task.run('concat');
    });

    grunt.registerTask('server', [
        'concat_scripts',
        'jshint',
        'assemble',
        'copy',
        //'uglify',
        'ngmin',
        'connect:server',
        'open:server',
        'watch'
    ]);
    grunt.registerTask('design', [
        'concat_scripts',
        'jshint',
        'assemble',
        'copy',
        //'uglify
        'ngmin'
    ]);

};

