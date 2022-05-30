const withTM = require("next-transpile-modules")(["api"]);

module.exports = withTM({
  reactStrictMode: true,
});
