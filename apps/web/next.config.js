const withTM = require("next-transpile-modules")(["@stocks/api"]);

module.exports = withTM({
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      "avatars.githubusercontent.com",
      "avatars.dicebear.com",
    ],
  },
});
