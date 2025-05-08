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
    const { trackTTI } = await import('../metrics/tti');
    trackTTI();
    console.log('[Optic] TTI tracking enabled');
  }
  if (startup) {
    const { trackStartupTime } = await import('../metrics/startup');
    trackStartupTime();
    console.log('[Optic] Startup tracking enabled');
  }
  if (reRenders) {
    const { setupRenderTracking } = await import('../metrics/reRenders');
    setupRenderTracking();
    console.log('[Optic] Re-render tracking enabled');
  }
}
