module.exports = function (grunt) {
    var userConfig = require('./scripts/build.conf.js');
    var taskConfig = {
        pkg: grunt.file.readJSON('package.json'),
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
        html2js: {
            options: {
            }
        },
        jshint: {
            options: {
                jshintrc: 'scripts/.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'scripts/*.js',
                '<%= src.app %>/{,*/}*.js',
                '<%= src.mod %>/{,*/}*.js'
            ]
        },
        ngmin: {
            app: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= build.app %>',
                        src: [ '**/*.js' , '!**/*.min.js', '!**/*.spec.js'],
                        dest: '<%= build.app %>/',
                        ext: '.min.js'
                    }
                ]
            },
            mod: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= build.mod %>',
                        src: [ '**/*.js' , '!**/*.min.js', '!**/*.spec.js'],
                        dest: '<%= build.mod %>/',
                        ext: '.min.js'
                    }
                ]
            }
        },
        copy: {
            assets: {
                files: [
                    {
                        src: [ '**' ],
                        cwd: '<%= src.assets %>',
                        dest: '<%= build.assets %>/',
                        expand: true
                    }
                ]
            },
            md: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= build.md %>',
                        cwd: '<%= src.md %>',
                        expand: true
                    }
                ]
            },
            htmlApp: {
                files: [
                    {
                        cwd: '<%= src.app %>/',
                        src: [ '**/*.html' ],
                        dest: '<%= build.app %>/',
                        expand: true
                    }
                ]
            },
            htmlMod: {
                files: [
                    {
                        cwd: '<%= src.mod %>',
                        src: [ '**/*.html' ],
                        dest: '<%= build.mod %>/',
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
                    assets: '<%= build.assets %>',
                    //helpers: ['src/helpers/helper-*.js'],
                    layoutdir: '<%= src.layouts %>',
                    layout: 'default.hbs',
                    data: [
                        '<%= src.app %>/*.{json,yml}',
                     //   '<%= src.app %>/*/*.{json,yml}',
                        'package.json'
                    ],
                    partials: [
                        '<%= src.includes %>/*.hbs'
                    ]
                },
                files: {
                    '<%= build.dir %>/': ['<%= src.app %>/*/*.hbs']
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
                    base: '<%= build.dir %>'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'scripts/karma.conf.js'
                // singleRun: true
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.server.options.port %>'
            }
        },
        watch: {
            livereload: {
                files: ['!src/*.html', 'src/**/*.js', 'src/**/*.html', 'src/**/*.css', 'src/**/*.yml', 'src/**/*.hbs'],
                tasks: ['design']
            }
        },
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= build %>/*',
                            '!<%= build %>/vendor'
                        ]
                    }
                ]
            },
            server: '.tmp'
        }
    };
    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('assemble');


    function createSubtask(name, src, build, sub, srcPattern, buildFile) {
        var dir = src + '/' + sub;
        var pattern = srcPattern.join('/');
        var items = grunt.file.expand({filter: 'isFile', cwd: (dir) }, pattern);
        console.log(name + '_match:' + dir + '/' + pattern + ' = ' + items.length);
        if (items.length > 0) {
            var task = grunt.config.get(name) || {};
            task[dir] = {
                src: [dir + '/' + pattern],
                dest: build + '/' + sub + '/' + buildFile,
                module: sub + '/' + srcPattern[0]
            };
            grunt.config.set(name, task);
        }
    }

    grunt.registerTask('concat_scripts', 'concat scripts', function () {
        console.log('concat_scripts');
        var task = 'concat',src = 'src',build = 'build',js = '{,*/}*.js';
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'mod/*/*').forEach(function (mod) {
            createSubtask(task,src,build,mod+'/'+'scripts',[js],'mod.js');
            createSubtask(task,src,build,mod+'/'+'tests',['unit',js],'mod-unit.spec.js');
            createSubtask(task,src,build,mod+'/'+'tests',['e2e',js],'mod-e2e.spec.js');
        });
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'app/*').forEach(function (app) {
            createSubtask(task,src,build,app+'/'+'scripts',[js],'app.js');
            createSubtask(task,src,build,app+'/'+'tests',['unit',js],'app-unit.spec.js');
            createSubtask(task,src,build,app+'/'+'tests',['e2e',js],'app-e2e.spec.js');
        });
        grunt.task.run(task);
    });

    grunt.registerTask('html2js_scripts', 'html2js scripts', function () {
        var task = 'html2js',src = 'src',build = 'build'; html = '{,*/}*.html';
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'mod/*/*').forEach(function (mod) {
            createSubtask(task,src,build,mod,['views',html],'scripts/mod-templates.js');
        });
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'app/*').forEach(function (app) {
            createSubtask(task,src,build,app,['views',html],'scripts/app-templates.js');
        });
        grunt.task.run(task);
    });

    grunt.registerTask('server', [
        'concat_scripts',
        'html2js_scripts',
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
        'html2js_scripts',
        'jshint',
        'assemble',
        'copy',
        //'uglify
        'ngmin'
    ]);
    grunt.registerTask('test', [
        'concat_scripts',
        'jshint',
        'assemble',
        'copy',
        'html2js_scripts',
        //'uglify',
        'ngmin',
        'connect:server',
        'karma'
    ]);

};

