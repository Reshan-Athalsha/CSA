export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

/**
 * Format seconds into a human-readable swim time (e.g. "1:23.45" or "28.54s").
 * Shared across RaceTimes, PoolsideCheckIn, FamilyDashboard, SwimmerStats, Meets.
 */
export function formatTime(secs: number | null | undefined): string {
  if (!secs) return '–';
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(2).padStart(5, '0');
  return m > 0 ? `${m}:${s}` : `${parseFloat(s).toFixed(2)}s`;
}