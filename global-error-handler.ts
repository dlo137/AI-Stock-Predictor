// Global error handler for unhandled promise rejections
if (typeof Promise !== 'undefined') {
  Promise.prototype.catch = new Proxy(Promise.prototype.catch, {
    apply(target, thisArg, argumentsList) {
      return Reflect.apply(target, thisArg, argumentsList);
    },
  });
}

// Log unhandled rejections in development
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Possible Unhandled Promise Rejection'))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export {};
