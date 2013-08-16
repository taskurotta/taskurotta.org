module.exports = function (grunt) {
    var yaml = require('js-yaml');
    var path = require('path');
    var dirsum = require('dirsum');
    var sh = require('shorthash');
    var extend = require('node.extend');
    var userConfig = require('./scripts/build.conf.js');
    var srcDir = 'src',
         buildDir = 'build';
    var buildAppDir = buildDir + '/app/';
    var buildModDir = buildDir + '/mod/';
    var buildAssetsDir = buildDir + '/assets/';
    var jsFiles = '**/*.js';
    var htmlFiles = '**/*.html';
    var hbsFiles = '**/*.hbs';
    var pngFiles = '**/*.png';
    var cssFiles = '**/*.css';

    var taskConfig = {
        pkg: grunt.file.readJSON('package.json'),
        cfg: grunt.file.readYAML(srcDir + '/config.yml'),
        banner: '/**\n' +
            ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' */\n',
        concat: {
            options: {
                banner: '<%= banner %>',
                separator: '\n/*-------------*/\n',
                nonull: true
            }
        },
        yamlhint: {
            options: {
            }
        },
        html2js: {
            options: {
                quoteChar: '\''
            }
        },
        jshint: {
            options: {
                jshintrc: 'scripts/.jshintrc',
                ignores: ['**/scripts/app-config.js']
            },
            all: [
                'Gruntfile.js',
                //'scripts/*.js',
                buildModDir + jsFiles,
                buildAppDir + jsFiles
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
            md: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= build.md %>',
                        cwd: '<%= src.md %>',
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
                files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.css', 'src/**/*.yml', 'src/**/*.hbs', 'Gruntfile.js'],
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
                            buildModDir + '*',
                            buildAssetsDir + '*'
                        ]
                    }
                ]
            }
        }
    };
    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('assemble');

    function createSubtaskCall(name, subname, dir, pattern, callback) {
        console.log('SubtaskCall ' + name + ':' + subname);
        var task = grunt.config.get(name) || {};
        if (!task.hasOwnProperty(subname)) {
            var items = grunt.file.expand({filter: 'isFile', cwd: (dir) }, pattern);
            var source;
            if (Array.isArray(pattern)) {
                source = [];
                pattern.map(function (item) {
                    source.push(dir + '/' + item);
                });
                console.log(name + ':' + subname + ' match:' + source.toString() + ' = ' + items.length);
            } else {
                source = dir + '/' + pattern;
                console.log(name + ':' + subname + ' match:' + source + ' = ' + items.length);
            }
            if (items.length > 0) {
                task[subname] = callback(source);
                grunt.config.set(name, task);
            }
        }
    }

    function iterate(object, callback) {
        console.log('iterate object');
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                console.log('object field:' + property);
                callback(property, object[property]);
            }
        }
    }

    function readConfig(path, callback) {
        var config = {};
        if (grunt.file.exists(path + '/config.yml')) {
            console.log('read ' + path + '/config.yml');
            config = grunt.file.readYAML(path + '/config.yml');
            if (typeof(callback) !== 'undefined') {
                callback(config);
            }
        }
        return config;
    }

    function readBower(path, callback) {
        var config = null;
        if (grunt.file.exists(path + '/.bower.json')) {
            console.log('read ' + path + '/.bower.json');
            config = grunt.file.readJSON(path + '/.bower.json');
            if (typeof(callback) !== 'undefined') {
                callback(config);
            }
        }
        return config;
    }

    function dirHash(path,callback){
        dirsum.digest(path, 'md5', function (err, hashes) {
            if (err) {
                throw err;
            }
            var hash = sh.unique(hashes.hash);
            console.log(hash + ' =hash '+ hashes.hash);
            callback(hash);
        });
    }

    grunt.registerTask('generate_configs', 'generate_configs', function () {
        console.log('generate_configs');
        var done = this.async();
        var threads = 1;
        var baseConfig = grunt.config.get('cfg');

        function threadDone() {
            threads--;
            if (threads === 0) {
                grunt.config.set('cfg', baseConfig);
                done();
            }
        }

        var template = baseConfig.template;
        readConfig(template.src, function (templateConfig) {
            extend(true, baseConfig, templateConfig);
        });
        threads++;
        dirHash(template.src,function (hash) {
            template.key = hash;
            threadDone();
        });

        //iterate apps
        iterate(baseConfig.apps, function (appName, app) {
            console.log('app:' + appName);
            var appSrc = app.src + '/app/' + appName;
            threads++;
            dirHash(appSrc,function (hash) {
                app.key = hash;
                threadDone();
            });
            console.log('0');
            var appLoadedConfig = readConfig(appSrc);
            console.log('1');
            var appConfig = extend(true, {}, baseConfig, appLoadedConfig);
            console.log('2');
            iterate(appConfig.mods, function (modName, mod) {
                console.log('mod:' + modName);
                var modSrc = mod.src + '/mod/' + modName;
                readConfig(modSrc, function (modConfig) {
                    appConfig = extend(true, {}, modConfig, appConfig);
                });
            });

            iterate(appConfig.libs, function (libName, lib) {
                //Copy libs css,js files
                var libSrc = lib.src + '/' + libName;
                readBower(libSrc, function (libConfig) {
                    lib.version = libConfig.version;
                });
            });

            grunt.config.set('config:' + appName, appConfig);
            console.log(grunt.config.get('config:' + appName));
        });

        threadDone();
    });

    grunt.registerTask('save_configs', 'generate_configs', function () {
        var baseConfig = grunt.config.get('cfg');
        //iterate apps
        iterate(baseConfig.apps, function (appName, app) {
            console.log(appName);
            var appDest = path.join(buildDir, 'app', appName, app.key);
            var appConfig = grunt.config.get('config:' + appName);
            var content = JSON.stringify(appConfig);
            var obj = JSON.parse(content);
            var template = 'var appConfig = ' + content + ';';
            grunt.file.write(appDest + '/scripts/app-config.js', template);
            grunt.file.write(appDest + '/scripts/app-config.yml', yaml.dump(appConfig));
        });
    });

    grunt.registerTask('concat_scripts', 'concat scripts', function () {
        console.log('concat_scripts');
        var task = 'concat';
        var baseConfig = grunt.config.get('cfg');
        iterate(baseConfig.apps, function (appName, app) {
            console.log(appName);
            var appSrc = path.join(app.src, 'app', appName);
            var appDest = path.join(buildDir, 'app', appName, app.key);
            createSubtaskCall(task, 'app_' + appName + '_scripts', appSrc + '/scripts', jsFiles, function (pattern) {
                app.scripts = app.scripts || [];
                app.scripts.push(appDest + '/scripts/app.js');
                return { dest: appDest + '/scripts/app.js', src: pattern};
            });
            createSubtaskCall(task, 'app_' + appName + '_units', appSrc + '/tests/unit', jsFiles, function (pattern) {
                return { dest: appDest + '/tests/app-unit.spec.js', src: pattern  };
            });
            createSubtaskCall(task, 'app_' + appName + '_e2e', appSrc + '/tests/e2e', jsFiles, function (pattern) {
                return {  dest: appDest + '/tests/app-e2e.spec.js', src: pattern };
            });

            //iterate mods for applications
            var appConfig = grunt.config.get('config:' + appName);
            iterate(appConfig.mods, function (modName, mod) {
                console.log(modName + ':' + mod.version);
                var modDest = path.join(buildDir, 'mod', modName, mod.version);
                var modSrc = path.join(mod.src, 'mod', modName);
                createSubtaskCall(task, 'mod_' + modName + mod.version + '_scripts', modSrc + '/scripts', jsFiles, function (pattern) {
                    mod.scripts = mod.scripts || [];
                    mod.scripts.push(modDest + '/scripts/mod.js');
                    return { dest: modDest + '/scripts/mod.js', src: pattern  };
                });
                createSubtaskCall(task, 'mod_' + modName + mod.version + '_units', modSrc + '/tests/unit', jsFiles, function (pattern) {
                    return { dest: modDest + '/tests/mod-unit.spec.js', src: pattern };
                });
                createSubtaskCall(task, 'mod_' + modName + mod.version + '_e2e', modSrc + '/tests/e2e', jsFiles, function (pattern) {
                    return { dest: modDest + '/tests/mod-e2e.spec.js', src: pattern };
                });
            });

        });


        grunt.config.set('cfg', baseConfig);
        grunt.task.run(task);
    });

    grunt.registerTask('html2js_scripts', 'html2js scripts', function () {
        var task = 'html2js';
        var baseConfig = grunt.config.get('cfg');
        iterate(baseConfig.apps, function (appName, app) {
            console.log(appName);
            var appSrc = path.join(app.src, 'app', appName);
            createSubtaskCall(task, 'app_' + appName + '_views', appSrc + '/views', htmlFiles, function (pattern) {
                var appDest = path.join(buildDir, 'app', appName, app.key);
                //app.scripts.push(appDest + '/scripts/app-templates.js');
                return { dest: appDest + '/scripts/app-templates.js', src: pattern,
                    options: { base: app.src, module: 'app/' + appName + '/views' }
                };
            });

            //iterate mods for applications
            var appConfig = grunt.config.get('config:' + appName);
            iterate(appConfig.mods, function (modName, mod) {
                console.log(modName + ':' + mod.version);
                var modSrc = path.join(mod.src, 'mod', modName);
                createSubtaskCall(task, 'mod_' + modName + mod.version + '_views', modSrc + '/views', htmlFiles, function (pattern) {
                    var modDest = path.join(buildDir, 'mod', modName, mod.version);
                    //mod.scripts.push(modDest + '/scripts/mod-templates.js');
                    return { dest: modDest + '/scripts/mod-templates.js', src: pattern,
                        options: { base: mod.src, module: 'mod/' + modName + '/views' }
                    };
                });
            });

        });

        grunt.config.set('cfg', baseConfig);
        grunt.task.run(task);
    });

    grunt.registerTask('copy_files', 'copy files', function () {
        var task = 'copy';
        var baseConfig = grunt.config.get('cfg');
        console.log(baseConfig);
        iterate(baseConfig.apps, function (appName, app) {
            console.log(appName);
            var template = baseConfig.template;
            var templateSrc = template.src;
            console.log(templateSrc);
            var appSrc = path.join(app.src, 'app', appName);
            var appDest = path.join(buildDir, 'app', appName, app.key);
            var assetsDest = path.join(buildDir, 'assets');
            var templateDest = path.join(assetsDest, template.key);
            console.log(template);
            //Copy templates hbs files
            createSubtaskCall(task, 'app_' + appName + '_template_hbs', templateSrc, hbsFiles, function () {
                return { expand: true, cwd: templateSrc, src: hbsFiles, dest: appDest };
            });
            //Copy application hbs files
            createSubtaskCall(task, 'app_' + appName + '_app_hbs', appSrc, hbsFiles, function () {
                return { expand: true, cwd: appSrc, src: hbsFiles, dest: appDest };
            });
            //Copy templates css,png files  @todo
            createSubtaskCall(task, 'template_css', templateSrc, [cssFiles, pngFiles], function () {
                return { expand: true, cwd: templateSrc, src: [cssFiles, pngFiles], dest: templateDest };
            });

            //iterate libs for applications
            var appConfig = grunt.config.get('config:' + appName);
            iterate(appConfig.libs, function (libName, lib) {
                //Copy libs css,js files
                var libSrc = lib.src + '/' + libName;
                createSubtaskCall(task, 'lib_' + libName + lib.version, libSrc, lib.file, function () {
                    return { expand: true, cwd: libSrc, src: lib.file,
                        dest: assetsDest + '/vendor/' + libName + '/'+lib.version};
                });
            });
        });
        grunt.task.run(task);

    });

    grunt.registerTask('prepare_assemble', 'prepare assemble scripts', function () {
        var task = 'assemble';
        var baseConfig = grunt.config.get('cfg');
        iterate(baseConfig.apps, function (appName, app) {
            console.log(appName);
            var appSrc = path.join(app.src, 'app', appName);
            var appDest = path.join(buildDir, 'app', appName, app.key);
            var appConfig = grunt.config.get('config:' + appName);
            var template = baseConfig.template;
            var assetsDest = path.join(buildDir, 'assets', template.key);

            app.name = appName;
            app.urls = [];
            app.urls.push('app/' + appName + '/' + app.key + '/scripts/app-config.min.js');
            app.urls.push('app/' + appName + '/' + app.key + '/scripts/app.js');
            app.urls.push('app/' + appName + '/' + app.key + '/scripts/app-templates.js');
            app.mods = [];
            iterate(appConfig.mods, function (modName, mod) {
                app.mods.push('mod/' + modName + '/' + mod.version + '/scripts/mod.js');
                app.mods.push('mod/' + modName + '/' + mod.version + '/scripts/mod-templates.js');
            });
            app.libs = [];
            iterate(appConfig.libs, function (libName, lib) {
                app.libs.push('assets/vendor/' + libName + '/' + lib.version + '/' + lib.file);
            });

            createSubtaskCall(task, 'app_' + appName, appDest, hbsFiles, function () {
                return {
                    options: {
                        cfg: appConfig,
                        app: app,
                        flatten: true,
                        assets: assetsDest,
                        layoutdir: appDest + '/_layouts',
                        layout: 'default.hbs',
                        partials: [
                            appDest + '/_includes/*.hbs'
                        ],
                        data: [
                            appSrc + '/*.yml',
                            appDest + '/*.yml'
                        ]
                    },
                    files: {
                        '<%= build.dir %>/': [appDest + '/*.hbs']
                    }
                };
            });
        });
        grunt.config.set('cfg', baseConfig);

    });

    grunt.registerTask('watch_apps', 'prepare assemble scripts', function () {
        var task = 'watch';
        var baseConfig =  grunt.config.get('cfg');
        iterate(baseConfig.apps,function (appName,app) {
            createSubtaskCall(task, 'app_' + appName, app.src,
                [jsFiles, htmlFiles, cssFiles, '**/*.yml', hbsFiles], function (pattern) {
                return { files: pattern, tasks: ['design'] };
            });
        });
        grunt.task.run(task);
    });

    grunt.registerTask('server', [
        'clean:build',
        'generate_configs',
        'save_configs',
        'concat_scripts',
        'html2js_scripts',
        'copy_files',
        'prepare_assemble',
        'jshint',
        'assemble',
        //'uglify',
        'ngmin',
        'connect:server',
        'open:server',
        'watch_apps'
    ]);
    grunt.registerTask('design', [
        // 'clean:build',
        'generate_configs',
        'save_configs',
        'concat_scripts',
        'html2js_scripts',
        'copy_files',
        'prepare_assemble',
        'jshint',
        'assemble',
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

