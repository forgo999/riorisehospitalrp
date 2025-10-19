// Calculation: R$ 4.000 = 1 month (30 days) = 2.592.000 seconds
// R$ 1.000 = 7.5 days (proportional)
const SECONDS_PER_DAY = 24 * 60 * 60; // 86,400
const COST_PER_MONTH = 4000;
const DAYS_PER_MONTH = 30;

export function calculateCovenantTime(amountPaid: number): number {
  const days = (amountPaid / COST_PER_MONTH) * DAYS_PER_MONTH;
  return Math.floor(days * SECONDS_PER_DAY);
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // < 7 days
  isExpiringSoonMedium: boolean; // < 3 days
}

export function calculateTimeRemaining(endDate: string): TimeRemaining {
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const totalSeconds = Math.max(0, Math.floor((end - now) / 1000));

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const isExpired = totalSeconds <= 0;
  const isExpiringSoonMedium = totalSeconds > 0 && totalSeconds < 3 * 24 * 60 * 60; // < 3 days
  const isExpiringSoon = totalSeconds > 0 && totalSeconds < 7 * 24 * 60 * 60; // < 7 days

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired,
    isExpiringSoon,
    isExpiringSoonMedium
  };
}

export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  const { days, hours, minutes, seconds } = timeRemaining;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
