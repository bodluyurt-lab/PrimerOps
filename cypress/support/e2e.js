// Cypress Support File
// Import commands.js using ES2015 syntax:
// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global uncaught exception handler to prevent external script errors from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

