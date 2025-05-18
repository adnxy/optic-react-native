const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[useoptic]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[useoptic]', ...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error('[useoptic]', ...args);
  }
}; 