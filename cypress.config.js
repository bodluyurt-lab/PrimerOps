const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 375,
    viewportHeight: 812,
    video: true,
    videosFolder: 'cypress/videos',
    videoCompression: 32, // High quality MP4 encoding for YouTube demo
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    supportFile: 'cypress/support/e2e.js',
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // Node event listeners
    },
  },
});
