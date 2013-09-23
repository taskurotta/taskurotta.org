module.exports = function (grunt) {
    var yaml = require('js-yaml');
    var path = require('path');
    var dirsum = require('dirsum');
    var sh = require('shorthash');
    var extend = require('node.extend');
    var userConfig = require('./configs/build.conf.js');
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
    var hashes = {};

    var taskConfig = {
        pkg: grunt.file.readJSON('package.json'),
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
                jshintrc: 'configs/.jshintrc',
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
                configFile: 'configs/karma.conf.js'
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

    function fileExists(dir, pattern, callback) {
        var items = grunt.file.expand({filter: 'isFile', cwd: (dir) }, pattern);
        if (Array.isArray(pattern)) {
            source = [];
            pattern.map(function (item) {
                source.push(dir + '/' + item);
            });
            console.log('match:' + source.toString() + ' = ' + items.length);
        } else {
            source = dir + '/' + pattern;
            console.log('match:' + source + ' = ' + items.length);
        }
        if (items.length > 0) {
            callback(source);
        }
    }

    function createSubtask(name, subname, config) {
        var task = grunt.config.get(name) || {};
        if (!task.hasOwnProperty(subname)) {
            console.log('SubtaskCall ' + name + ':' + subname);
            //console.log(config);
            task[subname] = config;
            grunt.config.set(name, task);
        }
    }

    function iterate(object, callback) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                console.log('name:' + property);
                callback(property, object[property]);
            }
        }
    }

    function getFile(path, name) {
        if (grunt.file.exists(path + '/' + name)) {
            console.log('read ' + path + '/' + name);
        } else {
            grunt.fail.fatal('File ' + path + '/' + name + ' not found');
        }
        return path + '/' + name;
    }

    function readConfigFile(path) {
        return grunt.file.readYAML(getFile(path, 'config.yml'));
    }

    function readSettingFile(path) {
        return grunt.file.readYAML(getFile(path, 'settings.yml'));
    }

    function readBowerFile(path) {
        return grunt.file.readJSON(getFile(path, '.bower.json'));
    }

    function saveConfigFile(filePath, appConfig) {
        var content = JSON.stringify(appConfig);
        var obj = JSON.parse(content);
        var template = 'var appConfig = ' + content + ';';
        grunt.file.write(filePath, template);
        //grunt.file.write(appDest + '/scripts/app-config.yml', yaml.dump(appConfig));
    }

    function dirHash(path, callback) {
        var key = 'dir'+path;
        if (hashes.hasOwnProperty(key)) {
            callback(hashes[key]);
        }
        else {
            dirsum.digest(path, 'md5', function (err, dirHashes) {
                if (err) {
                    grunt.fail.fatal(err);
                }
                var hash = sh.unique(dirHashes.hash);
                hashes[key] = hash;
                console.log(hash + ' =hash ' + dirHashes.hash);
                callback(hash);
            });
        }
    }

    grunt.registerTask('generate_configs', 'generate_configs', function () {
        console.log('generate_configs');
        var done = this.async();
        var threads = 1;
        var baseSettings = readSettingFile(srcDir);
        if (!baseSettings.app) {
            grunt.fail.fatal('Portal application not exist');
        }
        var applications = baseSettings.app;
        var baseConfig = readConfigFile(srcDir);

        function threadDone() {
            threads--;
            if (threads === 0) {
                grunt.config.set('apps', applications);
                done();
            }
        }

        //iterate apps
        console.log('iterate apps');
        iterate(applications, function (appName, app) {
            console.log('app:' + appName);
            if (!app.src) {
                grunt.fail.fatal('Unknown app:' + appName + ' source');
            }
            var appSrc = app.src + '/app/' + appName;
            var appSettings = readSettingFile(appSrc);
            var appConfig = readConfigFile(appSrc);

            //application configuration
            extend(true, appSettings, baseSettings, appSettings);
            if (baseConfig.hasOwnProperty('app')) {
                if (baseConfig.app.hasOwnProperty(appName)) {
                    extend(true, appConfig.app, baseConfig.app[appName], appConfig.app);
                }
            }
            console.log('app config:');
            console.log(appConfig);
            //checksum for application src
            threads++;
            dirHash(appSrc, function (hash) {
                appSettings.app.key = hash;
                threadDone();
            });

            //template configuration
            if (!appSettings.template.src) {
                grunt.fail.fatal('Unknown template source');
            }
            var templateSrc = appSettings.template.src;
            threads++;
            dirHash(templateSrc, function (hash) {
                appSettings.template.key = hash;
                threadDone();
            });
            var templateConfig = readConfigFile(templateSrc);
            if (baseConfig.hasOwnProperty('template')) {
                extend(true, templateConfig, baseConfig.template);
            }
            if (appConfig.hasOwnProperty('template')) {
                extend(true, templateConfig, appConfig.template);
            }
            appConfig.template = templateConfig;
            console.log('template config:');
            console.log(appConfig.template);

            //mods configuration
            console.log('app ' + appName + ' iterate mods:');
            iterate(appSettings.mod, function (modName, mod) {
                console.log('mod:' + modName);
                if (!mod.src) {
                    grunt.fail.fatal('Unknown mod:' + modName + ' source');
                }
                var modSrc = mod.src + '/mod/' + modName;
                var modConfig = readConfigFile(modSrc);
                console.log('default mod ' + modName + ' config:');
                console.log(modConfig);
                if (!modConfig.version) {
                    grunt.fail.fatal('Unknown mod version for ' + modSrc);
                }
                if (modConfig.name !== modName) {
                    grunt.fail.fatal('Error mod name for ' + modSrc);
                }
                //extend mod properties
                mod.version = modConfig.version;
                if (baseConfig.hasOwnProperty('mod')) {
                    if (baseConfig.mod.hasOwnProperty(modName)) {
                        extend(true, modConfig, baseConfig.mod[modName]);
                        if (modConfig[mod.version]) {
                            extend(true, modConfig, modConfig[mod.version]);
                            delete modConfig[mod.version];
                        }


                    }
                }
                console.log('1 merged mod ' + modName + ' config:');
                console.log(modConfig);
                if (appConfig.hasOwnProperty('mod')) {
                    if (appConfig.mod.hasOwnProperty(modName)) {
                        extend(true, modConfig, appConfig.mod[modName]);
                    }
                } else {
                    appConfig.mod = {};
                }
                appConfig.mod[modName] = modConfig;
                console.log('all merged mod ' + modName + ' config:');
                console.log(appConfig.mod[modName]);
            });

            //libs configuration
            console.log('app ' + appName + ' iterate libs:');
            iterate(appSettings.lib, function (libName, lib) {
                console.log('lib:' + libName);
                if (!lib.src) {
                    grunt.fail.fatal('Unknown lib:' + libName + ' source');
                }
                var libSrc = lib.src + '/' + libName;
                var libConfig = readBowerFile(libSrc);
                if (!libConfig.version) {
                    grunt.fail.fatal('Unknown lib version for ' + libSrc);
                }
                lib.version = libConfig.version;
            });

            grunt.config.set('config:' + appName, appConfig);
            grunt.config.set('settings:' + appName, appSettings);
            console.log(grunt.config.get('config:' + appName));
        });

        threadDone();
    });

    grunt.registerTask('save_configs', 'generate_configs', function () {
        //iterate apps
        iterate(grunt.config.get('apps'), function (appName, app) {
            var appSettings = grunt.config.get('settings:' + appName);
            console.log('app:' + appName);
            var appConfig = grunt.config.get('config:' + appName);
            var appRef = 'app/' + appName + '/' + appSettings.app.key;
            var appDest = buildDir + '/' + appRef;
            saveConfigFile(appDest + '/scripts/app-config.js', appConfig);
            //add script url
            appSettings.scripts = [appRef + '/scripts/app-config.js'];
            appSettings.units = [];
            appSettings.e2e = [];
            grunt.config.set('settings:' + appName, appSettings);
        });
    });

    grunt.registerTask('concat_scripts', 'concat scripts', function () {
        console.log('concat_scripts');
        var task = 'concat';
        iterate(grunt.config.get('apps'), function (appName, app) {
            var appSettings = grunt.config.get('settings:' + appName);
            console.log('app:' + appName);
            var appSrc = app.src + '/app/' + appName;
            var appRef = 'app/' + appName + '/' + appSettings.app.key;
            var appDest = buildDir + '/' + appRef;
            fileExists(appSrc + '/scripts', jsFiles, function (pattern) {
                //add script url
                appSettings.scripts.push(appRef + '/scripts/app.js');
                createSubtask(task, 'app_' + appName + '_scripts', {
                    dest: appDest + '/scripts/app.js', src: pattern
                });
            });
            fileExists(appSrc + '/tests/unit', jsFiles, function (pattern) {
                createSubtask(task, 'app_' + appName + '_units', {
                    dest: appDest + '/tests/app-unit.spec.js', src: pattern
                });
            });
            fileExists(appSrc + '/tests/e2e', jsFiles, function (pattern) {
                createSubtask(task, 'app_' + appName + '_e2e', {
                    dest: appDest + '/tests/app-e2e.spec.js', src: pattern
                });
            });

            //iterate mods for applications
            console.log('app ' + appName + ' iterate mods:');
            iterate(appSettings.mod, function (modName, mod) {
                console.log('mod:' + modName + ':' + mod.version);
                var modSrc = mod.src + '/mod/' + modName;
                var modPath = 'mod/' + modName + '/' + mod.version;
                var modDest = buildDir + '/' + modPath;
                fileExists(modSrc + '/scripts', jsFiles, function (pattern) {
                    //add script url
                    appSettings.scripts.push(modPath + '/scripts/mod.js');
                    createSubtask(task, 'mod_' + modName + mod.version + '_scripts', {
                        dest: modDest + '/scripts/mod.js', src: pattern
                    });
                });
                fileExists(modSrc + '/tests/unit', jsFiles, function (pattern) {
                    appSettings.units.push(modPath + '/tests/mod-unit.spec.js');
                    createSubtask(task, 'mod_' + modName + mod.version + '_units', {
                        dest: modDest + '/tests/mod-unit.spec.js', src: pattern
                    });
                });
                fileExists(modSrc + '/tests/e2e', jsFiles, function (pattern) {
                    appSettings.e2e.push(modPath + '/tests/mod-e2e.spec.js');
                    createSubtask(task, 'mod_' + modName + mod.version + '_e2e', {
                        dest: modDest + '/tests/mod-e2e.spec.js', src: pattern
                    });
                });

            });
            grunt.config.set('settings:' + appName, appSettings);
        });
        grunt.task.run(task);
    });

    grunt.registerTask('html2js_scripts', 'html2js scripts', function () {
        var task = 'html2js';
        iterate(grunt.config.get('apps'), function (appName, app) {
            var appSettings = grunt.config.get('settings:' + appName);
            console.log('app:' + appName);
            var appSrc = app.src + '/app/' + appName;
            var appRef = 'app/' + appName + '/' + appSettings.app.key;
            var appDest = buildDir + '/' + appRef;
            fileExists(appSrc + '/views', htmlFiles, function (pattern) {
                //add script url
                appSettings.scripts.push(appRef + '/scripts/app-templates.js');
                createSubtask(task, 'app_' + appName + '_views', {
                    dest: appDest + '/scripts/app-templates.js', src: pattern,
                    options: { base: app.src, module: 'app/' + appName + '/views'}
                });
            });
            //iterate mods for applications
            console.log('app ' + appName + ' iterate mods:');
            iterate(appSettings.mod, function (modName, mod) {
                console.log(modName + ':' + mod.version);
                var modSrc = mod.src + '/mod/' + modName;
                var modPath = 'mod/' + modName + '/' + mod.version;
                var modDest = buildDir + '/' + modPath;
                fileExists(modSrc + '/views', htmlFiles, function (pattern) {
                    //add script url
                    appSettings.scripts.push(modPath + '/scripts/mod-templates.js');
                    createSubtask(task, 'mod_' + modName + mod.version + '_views', {
                        dest: modDest + '/scripts/mod-templates.js', src: pattern,
                        options: { base: mod.src, module: 'mod/' + modName + '/views' }
                    });
                });
            });
            grunt.config.set('settings:' + appName, appSettings);
        });
        //grunt.config.set('build_base', baseBuild);
        grunt.task.run(task);
    });

    grunt.registerTask('copy_files', 'copy files', function () {
        var task = 'copy';
        iterate(grunt.config.get('apps'), function (appName, app) {
            var appSettings = grunt.config.get('settings:' + appName);
            console.log('app:' + appName);
            var templateSrc = appSettings.template.src;
            var appSrc = app.src + '/app/' + appName;
            var appDest = buildDir + '/app/' + appName + '/' + appSettings.app.key;
            var assetsDest = buildDir + '/assets';
            var assetsKeyDest = assetsDest + '/' + appSettings.template.key;
            //Copy templates hbs files
            fileExists(templateSrc, hbsFiles, function () {
                createSubtask(task, 'app_' + appName + '_template_hbs', {
                    expand: true, cwd: templateSrc, src: hbsFiles, dest: appDest
                });
            });
            //Copy application hbs files
            fileExists(appSrc, hbsFiles, function () {
                createSubtask(task, 'app_' + appName + '_app_hbs', {
                    expand: true, cwd: appSrc, src: hbsFiles, dest: appDest
                });
            });
            //Copy templates css,png files  @todo
            fileExists(templateSrc, [cssFiles, pngFiles], function () {
                createSubtask(task, 'template_css', {
                    expand: true, cwd: templateSrc, src: [cssFiles, pngFiles], dest: assetsKeyDest
                });
            });

            //iterate libs for applications
            console.log('app ' + appName + ' iterate libs:');
            appSettings.vendors = [];
            iterate(appSettings.lib, function (libName, lib) {
                //Copy libs css,js files
                var libSrc = lib.src + '/' + libName;
                fileExists(libSrc, lib.file, function () {
                    //add script url
                    appSettings.vendors.push('assets/vendor/' + libName + '/' + lib.version + '/' + lib.file);
                    createSubtask(task, 'lib_' + libName + lib.version, {
                        expand: true, cwd: libSrc, src: lib.file,
                        dest: assetsDest + '/vendor/' + libName + '/' + lib.version
                    });
                });
            });
            grunt.config.set('settings:' + appName, appSettings);
        });
        grunt.task.run(task);

    });

    grunt.registerTask('prepare_assemble', 'prepare assemble scripts', function () {
        var task = 'assemble';
        iterate(grunt.config.get('apps'), function (appName, app) {
            var appSettings = grunt.config.get('settings:' + appName);
            var appConfig = grunt.config.get('config:' + appName);
            console.log('app:' + appName);
            var appSrc = app.src + '/app/' + appName;
            var appDest = buildDir + '/app/' + appName + '/' + appSettings.app.key;
            var assetsDest = buildDir + '/assets/' + appSettings.template.key;
            fileExists(appDest, hbsFiles, function () {
                createSubtask(task, 'app_' + appName, {
                    options: {
                        config: appConfig,
                        settings: appSettings,
                        app: appConfig.app,
                        flatten: true,
                        assets: assetsDest,
                        layoutdir: appDest + '/_layouts',
                        layout: 'default.hbs',
                        partials: [
                            appDest + '/_includes/*.hbs'
                        ]
                    },
                    files: {
                        '<%= build.dir %>/': [appDest + '/' + appName + '.hbs']
                    }
                });
            });
        });
    });

    grunt.registerTask('watch_apps', 'prepare assemble scripts', function () {
        var task = 'watch';
        iterate(grunt.config.get('apps'), function (appName, app) {
            fileExists(app.src, [jsFiles, htmlFiles, cssFiles, '**/*.yml', hbsFiles], function (pattern) {
                createSubtask(task, 'app_' + appName, {
                    files: pattern, tasks: ['design']
                });
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
        'karma'
    ]);
    grunt.registerTask('cl', [
        'clean:build'
    ]);

};

