// v0 configuration / feature flags.

export interface Config {
  /** Surface a job-applications lane. OFF by default — for most users job mail is noise. */
  includeJobLane: boolean;
  /** How far back to consider mail, in days. */
  windowDays: number;
  /** Minimum confidence to treat a classification as trusted; below this it goes to "review". */
  reviewThreshold: number;
}

export const defaultConfig: Config = {
  includeJobLane: false,
  windowDays: 180,
  reviewThreshold: 0.5,
};
