module.exports = {
  plugins: {
    '@csstools/postcss-global-data': {
      files: ['./src/app/globals.css'],
    },
    'postcss-preset-env': {
      stage: 2,
      features: {
        'custom-media-queries': true,
        'media-query-ranges': true,
      },
    },
    autoprefixer: {},
  },
};
