module.exports = function (grunt) {
    var yaml = require('js-yaml');
    var userConfig = require('./scripts/build.conf.js');
    var srcDir = 'src',
        buildDir = 'build';
    var srcAppDir = srcDir + '/app/';
    var srcModDir = srcDir + '/mod/';
    var buildAppDir = buildDir + '/app/';
    var buildModDir = buildDir + '/mod/';
    var jsFiles = '**/*.js';
    var htmlFiles = '**/*.html';
    var yamlFiles = '**/*.yml';

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
                src: [
                    srcModDir+yamlFiles,
                    srcAppDir+yamlFiles],
                dest: buildAppDir+'config.yml',
                options: {
                    banner: '#config\n',
                    separator: '\n # -------------  \n',
                    nonull: true
                }
            }
        },
        yamlhint: {
            options: {
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
                srcModDir+jsFiles,
                srcAppDir+jsFiles
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
            build: {
                files: [
                    {
                        dot: true,
                        src: [
                            buildAppDir + '*',
                            buildModDir + '*'
                        ]
                    }
                ]
            }
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
        grunt.file.expand({filter: 'isDirectory', cwd: srcDir}, 'app/*').forEach(function (app) {
            createSubtask(task,srcDir,buildDir,app+'/'+'scripts',[jsFiles],'app.js');
            createSubtask(task,srcDir,buildDir,app+'/'+'tests',['unit',jsFiles],'app-unit.spec.js');
            createSubtask(task,srcDir,buildDir,app+'/'+'tests',['e2e',jsFiles],'app-e2e.spec.js');
        });
        grunt.file.expand({filter: 'isDirectory', cwd: srcDir}, 'mod/*/*').forEach(function (mod) {
            createSubtask(task,srcDir,buildDir,mod+'/'+'scripts',[jsFiles],'mod.js');
            createSubtask(task,srcDir,buildDir,mod+'/'+'tests',['unit',jsFiles],'mod-unit.spec.js');
            createSubtask(task,srcDir,buildDir,mod+'/'+'tests',['e2e',jsFiles],'mod-e2e.spec.js');
        });
        grunt.task.run(task);
    });

    grunt.registerTask('yaml_scripts', 'yaml scripts', function () {
        try {
            var doc = grunt.file.read(buildAppDir+'config.yml');
            var obj = yaml.load(doc);
            console.log(doc);
        } catch (e) {
            grunt.warn(e);
          //  grunt.task.run(['watch']);
        }

    });

    grunt.registerTask('html2js_scripts', 'html2js scripts', function () {
        var task = 'html2js';
        grunt.file.expand({filter: 'isDirectory', cwd: srcDir}, 'mod/*/*').forEach(function (mod) {
            createSubtask(task,srcDir,buildDir,mod,['views',htmlFiles],'scripts/mod-templates.js');
        });
        grunt.file.expand({filter: 'isDirectory', cwd: srcDir}, 'app/*').forEach(function (app) {
            createSubtask(task,srcDir,buildDir,app,['views',htmlFiles],'scripts/app-templates.js');
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
    grunt.registerTask('cl', [
        'clean:build'
    ]);

};

