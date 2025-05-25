import { useMetricsStore } from '../store/metricsStore';

interface Trace {
  interactionName: string;
  componentName: string;
  duration: number;
  timestamp: number;
}

class TraceManager {
  private activeTraces: Map<string, number> = new Map();
  private traces: Trace[] = [];
  private readonly MAX_TRACES = 10;

  /**
   * Start tracing an interaction
   * @param interactionName Name of the interaction (e.g., 'OpenModal')
   */
  startTrace(interactionName: string) {
    if (!__DEV__) return;
    this.activeTraces.set(interactionName, Date.now());
  }

  /**
   * End tracing and record the duration
   * @param interactionName Name of the interaction
   * @param componentName Name of the component that rendered
   */
  endTrace(interactionName: string, componentName: string) {
    if (!__DEV__) return;

    const startTime = this.activeTraces.get(interactionName);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    const trace: Trace = {
      interactionName,
      componentName,
      duration,
      timestamp: Date.now()
    };

    this.traces.unshift(trace);
    if (this.traces.length > this.MAX_TRACES) {
      this.traces.pop();
    }

    useMetricsStore.getState().setTrace(trace);
    this.activeTraces.delete(interactionName);
  }

  /**
   * Get all traces
   */
  getTraces(): Trace[] {
    return [...this.traces];
  }

  /**
   * Clear all traces
   */
  clearTraces() {
    this.traces = [];
    this.activeTraces.clear();
  }
}

export const traceManager = new TraceManager();

// Export the public API
export const startTrace = traceManager.startTrace.bind(traceManager);
export const endTrace = traceManager.endTrace.bind(traceManager); 