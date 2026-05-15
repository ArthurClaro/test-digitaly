const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

export function formatTime(ms: number): string {
  const totalMs = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(totalMs / (MS_PER_SECOND * SECONDS_PER_MINUTE));
  const seconds = Math.floor((totalMs / MS_PER_SECOND) % SECONDS_PER_MINUTE);
  const millis = totalMs % MS_PER_SECOND;
  return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
}

export function formatTimeShort(ms: number): string {
  const totalSeconds = Math.floor(ms / MS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}
