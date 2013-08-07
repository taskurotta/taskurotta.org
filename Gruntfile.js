module.exports = function (grunt) {
    var userConfig = require('./scripts/build.conf.js');
    var src = 'src',
        build = 'build';
    var jsFiles = '{,*/}*.js';
    var htmlFiles = '{,*/}*.html';

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
            },
            yaml : {
                src: ['<%= src.app %>/{,*/}*.yml','<%= src.mod %>/{,*/}*.yml'],
                dest: '<%= build.app %>/config.yml',
                options: {
                    banner: '#config',
                    separator: '\n # -------------  \n',
                    nonull: true
                }
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
                //'scripts/*.js',
                '<%= src.app %>/**/*.js',
                '<%= src.mod %>/**/*.js'
            ]
        },

        ngmin: {
            app: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= build.app %>',
                        src: [ jsFiles , '!**/*.min.js', '!**/*.spec.js'],
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
                        src: [ jsFiles , '!**/*.min.js', '!**/*.spec.js'],
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
                        src: [ htmlFiles ],
                        dest: '<%= build.app %>/',
                        expand: true
                    }
                ]
            },
            htmlMod: {
                files: [
                    {
                        cwd: '<%= src.mod %>',
                        src: [ htmlFiles ],
                        dest: '<%= build.mod %>/',
                        expand: true
                    }
                ]
            }

        },
//        'bower-install': {
//            // Point to the html file that should be updated
//            // when you run `grunt bower-install`
//            html: 'src/_includes/scripts.hbs',
//
//            // Optional:
//            // If your scripts shouldn't contain a certain
//            // portion of a url, it can be excluded
//            ignorePath: 'app/'
//        } ,
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
                files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.css', 'src/**/*.yml', 'src/**/*.hbs'],
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
        var task = 'concat';
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'app/*').forEach(function (app) {
            createSubtask(task,src,build,app+'/'+'scripts',[jsFiles],'app.js');
            createSubtask(task,src,build,app+'/'+'tests',['unit',jsFiles],'app-unit.spec.js');
            createSubtask(task,src,build,app+'/'+'tests',['e2e',jsFiles],'app-e2e.spec.js');
        });
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'mod/*/*').forEach(function (mod) {
            createSubtask(task,src,build,mod+'/'+'scripts',[jsFiles],'mod.js');
            createSubtask(task,src,build,mod+'/'+'tests',['unit',jsFiles],'mod-unit.spec.js');
            createSubtask(task,src,build,mod+'/'+'tests',['e2e',jsFiles],'mod-e2e.spec.js');
        });
        grunt.task.run(task);
    });

    grunt.registerTask('yaml_scripts', 'yaml scripts', function () {
        try {
            var doc = grunt.file.readYAML(build+'/app/config.yml');
            grunt.file.write(build+'/app/config.json',doc,{
                encoding: 'UTF-8'
            });
            //var doc = re/quire('./'+build+'/app/config.yml');
            //var obj = yaml.load(doc);
            console.log(doc);
        } catch (e) {
            console.log(e);
        }
    });

    grunt.registerTask('html2js_scripts', 'html2js scripts', function () {
        var task = 'html2js';
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'mod/*/*').forEach(function (mod) {
            createSubtask(task,src,build,mod,['views',htmlFiles],'scripts/mod-templates.js');
        });
        grunt.file.expand({filter: 'isDirectory', cwd: src}, 'app/*').forEach(function (app) {
            createSubtask(task,src,build,app,['views',htmlFiles],'scripts/app-templates.js');
        });
        grunt.task.run(task);
    });

    grunt.registerTask('server', [
        'concat_scripts',
        'yaml_scripts',
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
        'yaml_scripts',
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

