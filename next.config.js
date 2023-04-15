/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
  // inlining images with extension .inline.png
  // https://www.dmitry-ishkov.com/2022/03/inlined-images-in-nextjs.html
  webpack: config => {
    // find the built-in loader
    const imageLoaderRule = config.module.rules.find(
      rule => rule.loader === 'next-image-loader'
    );
    // make the loader ignore *.inline files
    imageLoaderRule.exclude = /\.inline\.png$/i;

    // add a new URL loader for *.inline files
    config.module.rules.push({
      test: /\.inline\.png$/i,
      use: [
        {
          loader: 'url-loader',
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
