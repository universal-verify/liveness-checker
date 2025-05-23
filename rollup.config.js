import terser from '@rollup/plugin-terser';

export default {
    input: 'scripts/liveness-checker.js',
    output: [{
            file: 'build/liveness-checker.js',
            format: 'es',
        }, {
            file: 'build/liveness-checker.min.js',
            format: 'es',
            name: 'version',
            plugins: [
                terser({mangle: { keep_classnames: true, keep_fnames: true }}),
            ],
        },
    ],
};
