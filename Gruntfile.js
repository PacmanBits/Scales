module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['browserify', 'watch']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			main: {
				src: 'src/Example.js',
				dest: 'site/Example.js'
			},
			dist: {
				src: 'src/Scales.js',
				dest: 'site/Scales.js',
				options: {
					browserifyOptions: {
						standalone: 'Scales'
					}
				}
			}
		},
		watch: {
			files: 'src/*',
			tasks: ['default']
		}
	});
}