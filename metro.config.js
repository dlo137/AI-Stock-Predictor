const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize bundle size and loading speed
config.transformer.minifierConfig = {
  compress: {
    // Drop console logs in production
    drop_console: false,
  },
};

// Enable inline requires for faster startup
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

module.exports = config;
