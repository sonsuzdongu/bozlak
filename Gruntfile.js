module.exports = function (grunt) {
  'use strict';

  var assetsJsDir = 'assets/js';
  var assetsLessDir = 'assets/less';
  var publicDir = 'public/static';
  var bowerDir = 'bower_components';
  var assetsImgDir = 'assets/img';
  var buildDir = 'build';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  var configBridge = grunt.file.readJSON('./grunt/configBridge.json', { encoding: 'utf8' });

  // Project configuration.
  grunt.initConfig({

    // Task configuration.
    clean: {
      dist: publicDir,
      build: buildDir
    },

    jshint: {
      options: {
        jshintrc: assetsJsDir + '/.jshintrc'
      },
      grunt: {
        options: {
          jshintrc: 'grunt/.jshintrc'
        },
        src: ['Gruntfile.js', 'grunt/*.js']
      },
      bozlak: {
        src: assetsJsDir + '/**/*.js'
      }
    },

    concat: {
      options: {
        stripBanners: false
      },

      external: {
        src: [
          bowerDir + '/jquery/dist/jquery.js',
        ],
        dest: publicDir + '/js/external.js'
      },

      node: {
        src: [
          assetsJsDir + '/node.js',
        ],
        dest: publicDir + '/js/node.js'
      },

      bozlak: {
        src: [
          assetsJsDir + '/utils.js',
          assetsJsDir + '/locale/tr.js',
          assetsJsDir + '/locale/en.js',
          assetsJsDir + '/config/app.js',
          assetsJsDir + '/contextMenus.js',
          assetsJsDir + '/init.js',
        ],
        dest: publicDir + '/js/bozlak.js'
      },
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },

      external: {
        src: '<%= concat.external.dest %>',
        dest: publicDir + '/js/external.min.js'
      },
      bozlak: {
        src: '<%= concat.bozlak.dest %>',
        dest: publicDir + '/js/bozlak.min.js'
      },

      all: {
        src: [
            '<%= uglify.external.src %>',
            '<%= uglify.bozlak.src %>'
        ],

        dest: publicDir + '/js/all.min.js'
      }
    },


    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'bozlak.css.map',
          sourceMapFilename: publicDir + '/css/bozlak.css.map'
        },
        src: assetsLessDir + '/bozlak.less',
        dest: publicDir + '/css/bozlak.css'
      }
    },

    csslint: {
      options: {
        csslintrc: assetsLessDir + '/.csslintrc'
      },
      dist: [
        publicDir + '/css/bozlak.css',
      ]
    },

    cssmin: {
      options: {
        compatibility: 'ie8',
        keepSpecialComments: '*',
        noAdvanced: true
      },
      minifyCore: {
        src: publicDir + '/css/bozlak.css',
        dest: publicDir + '/css/bozlak.min.css'
      }
    },


    csscomb: {
      options: {
        config: assetsLessDir + '/.csscomb.json'
      },
      dist: {
        expand: true,
        cwd: publicDir + '/css/',
        src: ['*.css', '!*.min.css'],
        dest: publicDir + '/css/'
      }
    },

    copy: {
      fonts: {
        expand: true,
        cwd: 'assets/fonts/',
        src: '**',
        dest: publicDir + '/fonts'
      },
      img: {
        expand: true,
        cwd: 'assets/img/',
        src: '**',
        dest: publicDir + '/img'
      },
    },


    sprite:{
      sprite: {
        src: assetsImgDir + '/sprite/*.png',
        destImg: publicDir + '/img/sprite.png',
        destCSS: assetsLessDir + '/sprite.less',
        cssFormat: 'less',
        engine: 'gm',
        padding: 10,
       'cssVarMap': function (sprite) {
            sprite.name = 'bozlak-' + sprite.name;
            sprite.image = sprite.image.replace('../../' + publicDir , '..');
        },
      },
    },

    imagemin: {
      dynamic: {
        files: [{
            filter: 'isFile',
            expand: true,
            cwd: publicDir + '/',
            src: ["img/**"],
            dest: publicDir + '/'
        }]
      }
    },

   watch: {
      bozlak: {
        files: '<%= jshint.bozlak.src %>',
        tasks: ['concat', 'uglify']
      },
      less: {
        files: assetsLessDir + '/**/*.less',
        tasks: 'less'
      }
    },

    shell: {
        build: {
            command: function () {
                return 'mkdir -p build; zip -r build/package.nw index.html  package.json  public/';
            }
        }
    }

  });


  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  require('time-grunt')(grunt);

  var runSubset = function (subset) {
    return !process.env.TWBS_TEST || process.env.TWBS_TEST === subset;
  };
  // Test task.
  var testSubtasks = [];
  var jsoSubtasks = [];

  // Skip core tests if running a different subset of the test suite
  if (runSubset('core')) {
    testSubtasks = testSubtasks.concat(['dist-css', 'dist-js', 'csslint:dist']);
    jsoSubtasks = jsoSubtasks.concat(['dist-js']);
  }

  grunt.registerTask('test', testSubtasks);
  grunt.registerTask('jso', jsoSubtasks);

  // JS distribution task.
  grunt.registerTask('dist-js', ['concat']);

  // CSS distribution task.
  grunt.registerTask('less-compile', ['less:compileCore']);
  grunt.registerTask('dist-css', ['less-compile', 'csscomb:dist', 'cssmin:minifyCore']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean:dist', 'dist-css', 'copy:fonts', 'copy:img', 'dist-js']);

  // Default task.
  grunt.registerTask('default', ['clean:dist', 'copy:fonts', 'copy:img', 'test', 'sprite', 'uglify', 'imagemin']);
  
  grunt.registerTask('build-package', ['clean:build', 'shell:build']);

  // Version numbering task.
  // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
  // This can be overzealous, so its changes should always be manually reviewed!
  // grunt.registerTask('change-version-number', 'sed');

};
