export default {
    plugins: {
        '@tailwindcss/postcss': {},
        'postcss-preset-env': {
            features: {
                'oklab-function': { preserve: true },
                'color-functional-notation': { preserve: true },
            }
        },
        autoprefixer: {},
    },
}
