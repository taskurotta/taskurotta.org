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
                '<%= src.app %>/*/<%= file.scripts %>',
                '<%= src.app %>/*/<%= file.tests %>',
                '<%= src.mod %>/*/*/<%= file.scripts %>',
                '<%= src.mod %>/*/*/<%= file.tests %>'
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

    grunt.registerTask('concat_scripts', 'concat scripts', function () {
        console.log('concat_scripts');
        grunt.file.expand({filter: 'isDirectory', cwd: 'src/mod'}, '*/*').forEach(function (subDir) {
            console.log(subDir);
            var concat = grunt.config.get('concat') || {};
            var modDir = '<%= src.mod %>/' + subDir;
            var buildModDir = '<%= build.mod %>/' + subDir ;
            var scripts = modDir + '/<%= file.scripts %>';
            var units = modDir + '/<%= file.units %>';
            var e2e = modDir + '/<%= file.e2e %>';
//            if (grunt.file.exists(units)) {
                concat['mod_scripts_' + subDir ] = {
                    src: [scripts],
                    dest: buildModDir+ '/<%= file.mod.script %>'
                };
//            }
            //if (grunt.file.isMatch(units)) {
                concat['mod_units_' + subDir ] = {
                    src: [units],
                    dest: buildModDir  + '/<%= file.mod.unit %>'
                };
            //}
            //if (grunt.file.isMatch(e2e)) {
                concat['mod_e2e_' + subDir] = {
                    src: [e2e],
                    dest: buildModDir  + '/<%= file.mod.e2e %>'
                };
            //}
            grunt.config.set('concat', concat);
        });
        grunt.file.expand({filter: 'isDirectory', cwd: 'src/app'}, '*').forEach(function (subDir) {
            console.log(subDir);
            var concat = grunt.config.get('concat') || {};
            var appDir = '<%= src.app %>/' + subDir;
            var buildAppDir = '<%= build.app %>/' + subDir ;
            var scripts = appDir + '/<%= file.scripts %>';
            console.log(scripts);
            var units = appDir + '/<%= file.units %>';
            var e2e = appDir + '/<%= file.e2e %>';
//            if (grunt.file.exists(units)) {
                concat['app_scripts_' + subDir ] = {
                    src: [scripts],
                    dest: buildAppDir + '/<%= file.app.script %>'
                };
//            }
            //if (grunt.file.isMatch(units)) {
                concat['app_units_' + subDir ] = {
                    src: [units],
                    dest: buildAppDir  + '/<%= file.app.unit %>'
                };
            //}
            //if (grunt.file.isMatch(e2e)) {
                concat['app_e2e_' + subDir] = {
                    src: [e2e],
                    dest: buildAppDir  + '/<%= file.app.e2e %>'
                };
            //}
            grunt.config.set('concat', concat);
        });
        grunt.task.run('concat');
    });
    grunt.registerTask('html2js_scripts', 'html2js scripts', function () {
        grunt.file.expand({filter: 'isDirectory', cwd: 'src/mod'}, '*/*').forEach(function (subDir) {
            var html2js = grunt.config.get('html2js') || {};
            html2js['mod_' + subDir] = {
                src: ['<%= src.mod %>/' + subDir + '/<%= file.views %>'],
                dest: '<%= build.mod %>/' + subDir + '/<%= file.mod.templates %>',
                module: 'mod/' + subDir + '/views'
            };
            grunt.config.set('html2js', html2js);
        });
        grunt.file.expand({filter: 'isDirectory', cwd: 'src/app'}, '*').forEach(function (subDir) {
            var html2js = grunt.config.get('html2js') || {};
            html2js['app_' + subDir] = {
                src: ['<%= src.app %>/' + subDir + '/<%= file.views %>'],
                dest: '<%= build.app %>/' + subDir + '/<%= file.app.templates %>',
                module: 'app/' + subDir + '/views'
            };
            grunt.config.set('html2js', html2js);
        });
        grunt.task.run('html2js');
    });

    grunt.registerTask('server', [
        'concat_scripts',
        'jshint',
        'assemble',
        'copy',
        'html2js_scripts',
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
        'html2js_scripts',
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

