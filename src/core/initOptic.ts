export type InitOpticOptions = {
  tti?: boolean;
  startup?: boolean;
  reRenders?: boolean;
};

/**
 * Initializes Optic performance logging systems based on options.
 * All features are enabled by default.
 */
export async function InitOptic(options: InitOpticOptions = {}) {
  const {
    tti = true,
    startup = true,
    reRenders = true,
  } = options;

  if (tti) {
    await import('../metrics/tti');
    console.log('[Optic] TTI tracking enabled');
  }
  if (startup) {
    await import('../metrics/startup');
    console.log('[Optic] Startup tracking enabled');
  }
  if (reRenders) {
    await import('../metrics/reRenders');
    console.log('[Optic] Re-render tracking enabled');
  }
}
