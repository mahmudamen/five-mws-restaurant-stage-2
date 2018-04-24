module.exports = function( grunt ) {
    grunt.initConfig( {
        responsive_images: {
            dev: {
                options: {
                    rename: false,
                    engine: 'im',
                    sizes: [ {
                            width: 350,
                            suffix: "_small",
                            quality: 30,
          },
                        {
                            width: 800,
                            suffix: "_large",
                            quality: 50,
          } ]
                },
                files: [ {
                    expand: true,
                    src: [ '*.{gif,jpg,png}' ],
                    cwd: 'src_img/',
                    dest: 'img/'
        } ]
            }
        },
        clean: {
            dev: {
                src: [ 'img' ],
            },
        },
        mkdir: {
            dev: {
                options: {
                    create: [ 'img' ]
                },
            },
        },
    } );
    grunt.loadNpmTasks( 'grunt-responsive-images' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-mkdir' );
    grunt.registerTask( 'default', [ 'clean', 'mkdir', 'responsive_images' ] );
};