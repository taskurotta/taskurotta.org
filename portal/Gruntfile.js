module.exports = function (grunt) {
    var yaml = require('js-yaml');
    var path = require('path');
    var rand = require('generate-key');
    var dirsum = require('dirsum');
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
    var yamlFiles = '**/*.yml';
    var pngFiles = '**/*.png';
    var cssFiles = '**/*.css';

    var taskConfig = {
        pkg: grunt.file.readJSON('package.json'),
        cfg: grunt.file.readYAML(srcDir+'/config.yml'),
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
                buildModDir+jsFiles,
                buildAppDir+jsFiles
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
                files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.css', 'src/**/*.yml', 'src/**/*.hbs','Gruntfile.js'],
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


    function createSubtaskCall(name,subname, dir, pattern, callback) {
        var items = grunt.file.expand({filter: 'isFile', cwd: (dir) }, pattern);
        var source = dir + '/' + pattern;
        console.log(name + '_match:' + source + ' = ' + items.length);
        if (items.length > 0) {
            var task = grunt.config.get(name) || {};
            task[subname+'_'+dir] = callback(source);
            grunt.config.set(name, task);
        }
    }
    grunt.registerTask('generate_keys','generate_keys', function () {
        console.log('generate_keys');
        var done = this.async();
        var start = 0;
        var task = 'concat';
        var config = grunt.config.get('cfg');
        config.apps.map(function (app) {
            console.log(app.name);
            start++;
            dirsum.digest(app.src+'/app/'+app.name,'sha1',function(err, hashes) {
                if (err) { throw err; }
                app.key =  hashes.hash;
                console.log(hashes.hash);
                grunt.config.set('cfg',config);
                start--;
                if(start===0) { done(); }
            });

        });
        start++;
        dirsum.digest(config.template.src,'sha1',function(err, hashes) {
            if (err) { throw err; }
            config.template.key =  hashes.hash;
            console.log(hashes.hash);
            grunt.config.set('cfg',config);
            start--;
            if(start===0) { done(); }
        });
    });

    grunt.registerTask('concat_scripts', 'concat scripts', function () {
        console.log('concat_scripts');
        var task = 'concat';
        var config = grunt.config.get('cfg');
        config.mods.map(function (mod) {
            console.log(mod.name+':'+mod.version);
            var dest =  path.join(buildDir,'mod',mod.name,mod.version);
            var source =  path.join(mod.src,'mod',mod.name);
            createSubtaskCall(task,'mod', source + '/scripts', jsFiles, function (pattern) {
                mod.scripts = mod.scripts || [];
                mod.scripts.push(dest + '/scripts/mod.js');
                return { dest: dest + '/scripts/mod.js', src: pattern  };
            });
            createSubtaskCall(task,'mod', source + '/tests/unit', jsFiles, function (pattern) {
                return { dest: dest + '/tests/mod-unit.spec.js', src: pattern };
            });
            createSubtaskCall(task,'mod', source + '/tests/e2e', jsFiles, function (pattern) {
                return { dest: dest + '/tests/mod-e2e.spec.js', src: pattern };
            });
        });
        config.apps.map(function (app) {
            console.log(app.name);
            var source =  path.join(app.src,'app',app.name);
            var dest =  path.join(buildDir,'app',app.name,app.key);
            createSubtaskCall(task,'app', source + '/scripts', jsFiles, function (pattern) {
                app.scripts = app.scripts || [];
                app.scripts.push(dest + '/scripts/app.js');
                return { dest: dest + '/scripts/app.js', src: pattern};
            });
            createSubtaskCall(task,'app', source +'/tests/unit', jsFiles, function (pattern) {
                return { dest: dest + '/tests/app-unit.spec.js', src: pattern  };
            });
            createSubtaskCall(task,'app', source + '/tests/e2e', jsFiles, function (pattern) {
                return {  dest: dest + '/tests/app-e2e.spec.js', src: pattern };
            });
        });
        grunt.config.set('cfg',config);
        grunt.task.run(task);
    });

    grunt.registerTask('html2js_scripts', 'html2js scripts', function () {
        var task = 'html2js';
        var config = grunt.config.get('cfg');
        config.mods.map(function (mod) {
            console.log(mod.name+':'+mod.version);
            var source =  path.join(mod.src,'mod',mod.name);
            var dest =  path.join(buildDir,'mod',mod.name,mod.version);
            createSubtaskCall(task,mod.name,  source+'/views', htmlFiles, function (pattern) {
                mod.scripts.push(dest + '/scripts/mod-templates.js');
                return { dest: dest + '/scripts/mod-templates.js', src: pattern,
                    options: { base:mod.src,module: 'mod/' + mod.name + '/views' }
                };
            });
        });
        config.apps.map(function (app) {
            console.log(app.name);
            var source =  path.join(app.src,'app',app.name);
            var dest =  path.join(buildDir,'app',app.name,app.key);
            createSubtaskCall(task,app.name, source + '/views', htmlFiles, function (pattern) {
                app.scripts.push(dest + '/scripts/app-templates.js');
                return { dest: dest + '/scripts/app-templates.js', src: pattern,
                    options: { base: app.src, module: 'app/' + app.name + '/views' }
                };
            });
        });
        grunt.config.set('cfg',config);
        grunt.task.run(task);
    });

    grunt.registerTask('copy_files', 'copy files', function () {
        var task = 'copy';
        var config = grunt.config.get('cfg');
        config.apps.map(function (app) {
            console.log(app.name);
            var template = config.template;
            var source =  path.join(app.src,'app',app.name);
            var dest =  path.join(buildDir,'app',app.name,app.key);
            var assets =  path.join(buildDir,'assets',template.key);
            console.log(template);
            //Copy templates hbs files
            createSubtaskCall(task,app.name+'_hbs', template.src, hbsFiles, function () {
                return { expand: true, cwd:template.src,  src: [hbsFiles], dest: dest };
            });
            //Copy templates css,png files
            createSubtaskCall(task,app.name+'_assets', template.src, cssFiles, function () {
                return { expand: true, cwd:template.src,  src: [cssFiles,pngFiles], dest: assets };
            });
            config.libs.map(function (lib) {
                //Copy libs css,js files
                var libFolder=lib.src+'/'+lib.name;
                createSubtaskCall(task, app.name + '_'+lib.name, libFolder, lib.file, function () {
                    return { expand: true, cwd: libFolder, src: lib.file, dest: assets+'/vendor/'+lib.name };
                });
            });
                //Copy application css,png files
            createSubtaskCall(task,app.name, source, hbsFiles, function () {
                return { expand: true, cwd:source,  src: [hbsFiles], dest: dest };
            });


        });
       // grunt.config.set('cfg',config);
        grunt.task.run(task);

    });

    grunt.registerTask('prepare_assemble', 'prepare assemble scripts', function () {
        var task = 'assemble';
        var config = grunt.config.get('cfg');
        config.apps.map(function (app) {
            console.log(app.name);
            var source =  path.join(app.src,'app',app.name);
            var dest =  path.join(buildDir,'app',app.name, app.key);
            var assets =  path.join(buildDir,'assets',config.template.key);
            var newConfig = extend({},config,grunt.file.readYAML(source+'/config.yml'));
            var content = JSON.stringify(newConfig);
            var obj = JSON.parse(content);
            var template = 'var appConfig = '+ content +';';
            grunt.file.write(dest+'/scripts/app-config.js',template);
            grunt.file.write(dest+'/scripts/app-config.yml',yaml.dump(newConfig));
            createSubtaskCall(task,app.name, dest, hbsFiles, function () {
                return {
                    options:{
                        cfg: config,
                        mods: config.mods,
                        libs: config.libs,
                        app: app,
                        flatten: true,
                        assets: assets,
                        layoutdir: dest +'/_layouts',
                        layout:  'default.hbs',
                        partials: [
                            dest +'/_includes/*.hbs'
                        ],
                        data: [
                            source+ '/*.yml',
                            dest + '/*.yml'
                        ]
                    },
                    files: {
                        '<%= build.dir %>/': [dest+'/*.hbs']
                    }
                };
            });
        });
        grunt.config.set('cfg',config);

    });

//    yaml : {
//        src: [
//            srcAppDir+yamlFiles,
//            srcModDir+yamlFiles],
//            dest: buildAppDir+'config.yml',
//            options: {
//            banner: '#config\n',
//                separator: '\n # -------------  \n',
//                nonull: true
//        }
//    }


//    grunt.registerTask('yaml_scripts', 'yaml scripts', function () {
//        try {
//            var doc = grunt.file.read(buildAppDir+'config.yml');
//            var obj = yaml.load(doc);
//            console.log(doc);
//        } catch (e) {
//            grunt.warn(e);
//          //  grunt.task.run(['watch']);
//        }
//
//    });


    grunt.registerTask('server', [
       // 'clean:build',
        'generate_keys',
        'concat_scripts',
      //  'yaml_scripts',
        'html2js_scripts',
        'copy_files',
        'prepare_assemble',
        'jshint',
        'assemble',
        //'uglify',
        'ngmin',
        'connect:server',
        'open:server',
        'watch'
    ]);
    grunt.registerTask('design', [
       // 'clean:build',
        'generate_keys',
        'concat_scripts',
        //  'yaml_scripts',
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

